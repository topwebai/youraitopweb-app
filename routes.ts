import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateChatbotResponse, analyzeChatSentiment } from "./openai";
import { reportService } from "./reports";
import { insertInquirySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // AI Generation routes
  app.post("/api/ai/generate", isAuthenticated, async (req, res) => {
    try {
      const { prompt, contentType, tone, model } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Import openai here to avoid circular dependencies
      const { openai } = await import("./openai");

      let content = "";

      if (model === "dall-e-3") {
        // Image generation
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        content = response.data?.[0]?.url || "";
      } else if (model === "sora") {
        // Sora video generation (placeholder - Sora API may not be available yet)
        content = "Sora video generation is coming soon. Please check back later for this feature.";
      } else {
        // Text generation with GPT-4o
        const systemPrompt = contentType && tone 
          ? `You are a professional ${contentType.replace('_', ' ')} writer. Write in a ${tone} tone. Create high-quality content that is engaging and well-structured.`
          : "You are a professional content writer. Create high-quality, engaging content.";

        const response = await openai.chat.completions.create({
          model: model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });

        content = response.choices[0].message.content || "";
      }

      // Store the generation in database
      const generation = await storage.createAiGeneration({
        id: Math.random().toString(36).substr(2, 9),
        userId,
        type: model === "dall-e-3" ? "image" : model === "sora" ? "video" : "text",
        prompt,
        result: content,
        model: model || "gpt-4o",
        status: "completed"
      });

      res.json({ content, generation });
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Get user's AI generations
  app.get("/api/ai/generations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const generations = await storage.getUserAiGenerations(userId);
      res.json(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      
      // Here you could also send a notification email to the business
      res.json({ 
        success: true, 
        message: "Thank you for your inquiry! We will contact you shortly.",
        inquiryId: inquiry.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ message: "Failed to submit inquiry" });
      }
    }
  });

  // Chatbot endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId, conversationHistory = [] } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and sessionId are required" });
      }

      // Generate AI response
      const botResponse = await generateChatbotResponse(message, conversationHistory);
      
      // Analyze sentiment
      const sentiment = await analyzeChatSentiment(message);
      
      // Update conversation in database
      const updatedMessages = [
        ...conversationHistory,
        { role: "user", content: message, timestamp: new Date().toISOString() },
        { role: "assistant", content: botResponse, timestamp: new Date().toISOString() }
      ];

      let conversation = await storage.getChatConversation(sessionId);
      if (conversation) {
        await storage.updateChatConversation(conversation.id, {
          messages: updatedMessages,
        });
      } else {
        await storage.createChatConversation({
          sessionId,
          messages: updatedMessages,
        });
      }

      res.json({
        response: botResponse,
        sentiment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ 
        message: "I apologize, but I'm experiencing technical difficulties. Please contact us directly at 08 7480 2495." 
      });
    }
  });

  // Dashboard routes (protected)
  app.get('/api/dashboard/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/dashboard/client/:id/reports', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const reports = await storage.getReportsByClient(clientId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Admin routes for managing clients and reports
  app.post('/api/admin/generate-reports', isAuthenticated, async (req, res) => {
    try {
      const { month } = req.body;
      if (!month) {
        return res.status(400).json({ message: "Month is required (YYYY-MM format)" });
      }

      await reportService.generateAllReports(month);
      res.json({ success: true, message: `Reports generated for ${month}` });
    } catch (error) {
      console.error("Error generating reports:", error);
      res.status(500).json({ message: "Failed to generate reports" });
    }
  });

  app.post('/api/admin/send-reports', isAuthenticated, async (req, res) => {
    try {
      const { month } = req.body;
      if (!month) {
        return res.status(400).json({ message: "Month is required (YYYY-MM format)" });
      }

      await reportService.sendMonthlyReports(month);
      res.json({ success: true, message: `Reports sent for ${month}` });
    } catch (error) {
      console.error("Error sending reports:", error);
      res.status(500).json({ message: "Failed to send reports" });
    }
  });

  // Get inquiries (admin)
  app.get('/api/admin/inquiries', isAuthenticated, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // White-label brand routes
  app.get('/api/white-label/brands', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const brands = await storage.getUserWhiteLabelBrands(userId);
      res.json(brands);
    } catch (error) {
      console.error("Error fetching white-label brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.post('/api/white-label/brands', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const brandData = {
        ...req.body,
        userId
      };
      const brand = await storage.createWhiteLabelBrand(brandData);
      res.json(brand);
    } catch (error) {
      console.error("Error creating white-label brand:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.put('/api/white-label/brands/:id', isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      const brand = await storage.updateWhiteLabelBrand(brandId, req.body);
      res.json(brand);
    } catch (error) {
      console.error("Error updating white-label brand:", error);
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete('/api/white-label/brands/:id', isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      await storage.deleteWhiteLabelBrand(brandId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting white-label brand:", error);
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  // White-label client routes
  app.get('/api/white-label/brands/:brandId/clients', isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const clients = await storage.getBrandWhiteLabelClients(brandId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching white-label clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/white-label/brands/:brandId/clients', isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const clientData = {
        ...req.body,
        brandId
      };
      const client = await storage.createWhiteLabelClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating white-label client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/white-label/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.updateWhiteLabelClient(clientId, req.body);
      res.json(client);
    } catch (error) {
      console.error("Error updating white-label client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/white-label/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      await storage.deleteWhiteLabelClient(clientId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting white-label client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // White-label report routes
  app.get('/api/white-label/brands/:brandId/reports', isAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      const reports = await storage.getBrandWhiteLabelReports(brandId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching white-label reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/white-label/reports', isAuthenticated, async (req, res) => {
    try {
      const report = await storage.createWhiteLabelReport(req.body);
      res.json(report);
    } catch (error) {
      console.error("Error creating white-label report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/white-label/reports/:id', async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getWhiteLabelReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching white-label report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.put('/api/white-label/reports/:id', isAuthenticated, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.updateWhiteLabelReport(reportId, req.body);
      res.json(report);
    } catch (error) {
      console.error("Error updating white-label report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  app.delete('/api/white-label/reports/:id', isAuthenticated, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      await storage.deleteWhiteLabelReport(reportId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting white-label report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
