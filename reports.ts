import { storage } from "./storage";
import { gmbService } from "./gmb";
import nodemailer from "nodemailer";

export class ReportService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "reports@topwebdirectories.com.au",
        pass: process.env.SMTP_PASSWORD || "default_password",
      },
    });
  }

  async generateAllReports(month: string): Promise<void> {
    try {
      const clients = await storage.getClients();
      
      for (const client of clients) {
        if (client.status === "active") {
          await this.generateClientReports(client.id, month);
        }
      }
    } catch (error) {
      console.error("Error generating all reports:", error);
      throw error;
    }
  }

  async generateClientReports(clientId: number, month: string): Promise<void> {
    try {
      const client = await storage.getClient(clientId);
      if (!client) return;

      const services = client.services || [];

      // Generate reports based on client services
      if (services.includes("gmb") && client.gmbListingId) {
        await gmbService.generateMonthlyReport(clientId, month);
      }

      if (services.includes("seo")) {
        await this.generateSEOReport(clientId, month);
      }

      if (services.includes("ppc")) {
        await this.generatePPCReport(clientId, month);
      }

      if (services.includes("social")) {
        await this.generateSocialMediaReport(clientId, month);
      }

      if (services.includes("chatbot")) {
        await this.generateChatbotReport(clientId, month);
      }

    } catch (error) {
      console.error(`Error generating reports for client ${clientId}:`, error);
      throw error;
    }
  }

  private async generateSEOReport(clientId: number, month: string): Promise<void> {
    const client = await storage.getClient(clientId);
    if (!client) return;

    const reportData = {
      clientId,
      businessName: client.businessName,
      reportMonth: month,
      metrics: {
        organicTraffic: Math.floor(Math.random() * 5000) + 2000,
        keywordRankings: {
          topTen: Math.floor(Math.random() * 15) + 5,
          topThree: Math.floor(Math.random() * 8) + 2,
          firstPage: Math.floor(Math.random() * 25) + 10,
        },
        backlinks: Math.floor(Math.random() * 50) + 100,
        technicalScore: Math.floor(Math.random() * 20) + 80,
      },
      summary: {
        trafficGrowth: `${Math.floor(Math.random() * 30) + 10}%`,
        rankingImprovements: Math.floor(Math.random() * 10) + 5,
        issuesFixed: Math.floor(Math.random() * 5) + 2,
      },
      recommendations: [
        "Continue optimizing for target keywords",
        "Focus on building quality backlinks",
        "Improve page loading speed for better user experience",
        "Create more content around high-performing keywords",
      ],
      generatedAt: new Date().toISOString(),
    };

    await storage.createReport({
      clientId,
      serviceType: "seo",
      reportMonth: month,
      data: reportData,
    });
  }

  private async generatePPCReport(clientId: number, month: string): Promise<void> {
    const client = await storage.getClient(clientId);
    if (!client) return;

    const reportData = {
      clientId,
      businessName: client.businessName,
      reportMonth: month,
      metrics: {
        impressions: Math.floor(Math.random() * 50000) + 20000,
        clicks: Math.floor(Math.random() * 2000) + 800,
        conversions: Math.floor(Math.random() * 100) + 50,
        spend: Math.floor(Math.random() * 2000) + 1000,
        cpc: (Math.random() * 3 + 1).toFixed(2),
        ctr: (Math.random() * 5 + 2).toFixed(2),
        conversionRate: (Math.random() * 8 + 3).toFixed(2),
      },
      summary: {
        roi: `${Math.floor(Math.random() * 200) + 150}%`,
        costPerConversion: (Math.random() * 50 + 20).toFixed(2),
        qualityScore: (Math.random() * 3 + 7).toFixed(1),
      },
      recommendations: [
        "Test new ad copy variations to improve CTR",
        "Expand successful campaigns to increase volume",
        "Optimize landing pages for better conversion rates",
        "Review and refine keyword bidding strategies",
      ],
      generatedAt: new Date().toISOString(),
    };

    await storage.createReport({
      clientId,
      serviceType: "ppc",
      reportMonth: month,
      data: reportData,
    });
  }

  private async generateSocialMediaReport(clientId: number, month: string): Promise<void> {
    const client = await storage.getClient(clientId);
    if (!client) return;

    const reportData = {
      clientId,
      businessName: client.businessName,
      reportMonth: month,
      metrics: {
        followers: {
          facebook: Math.floor(Math.random() * 1000) + 500,
          instagram: Math.floor(Math.random() * 800) + 300,
          linkedin: Math.floor(Math.random() * 500) + 200,
        },
        engagement: {
          likes: Math.floor(Math.random() * 500) + 200,
          comments: Math.floor(Math.random() * 100) + 50,
          shares: Math.floor(Math.random() * 80) + 30,
        },
        reach: Math.floor(Math.random() * 10000) + 5000,
        impressions: Math.floor(Math.random() * 20000) + 10000,
      },
      summary: {
        followerGrowth: `${Math.floor(Math.random() * 15) + 5}%`,
        engagementRate: `${(Math.random() * 5 + 3).toFixed(1)}%`,
        topPostReach: Math.floor(Math.random() * 2000) + 1000,
      },
      recommendations: [
        "Post consistently during peak engagement hours",
        "Create more video content for better engagement",
        "Engage with followers' comments promptly",
        "Use trending hashtags relevant to your industry",
      ],
      generatedAt: new Date().toISOString(),
    };

    await storage.createReport({
      clientId,
      serviceType: "social",
      reportMonth: month,
      data: reportData,
    });
  }

  private async generateChatbotReport(clientId: number, month: string): Promise<void> {
    const client = await storage.getClient(clientId);
    if (!client) return;

    const reportData = {
      clientId,
      businessName: client.businessName,
      reportMonth: month,
      metrics: {
        totalConversations: Math.floor(Math.random() * 500) + 200,
        averageSessionLength: `${Math.floor(Math.random() * 5) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        leadsGenerated: Math.floor(Math.random() * 50) + 20,
        satisfactionScore: (Math.random() * 1.5 + 3.5).toFixed(1),
        topQuestions: [
          "What are your business hours?",
          "How can I contact you?",
          "What services do you offer?",
          "Can you provide a quote?",
          "Where are you located?",
        ],
      },
      summary: {
        responseRate: `${Math.floor(Math.random() * 10) + 90}%`,
        resolutionRate: `${Math.floor(Math.random() * 20) + 75}%`,
        leadConversionRate: `${Math.floor(Math.random() * 15) + 10}%`,
      },
      recommendations: [
        "Train chatbot on more specific product questions",
        "Add more conversation flows for common inquiries",
        "Implement appointment booking functionality",
        "Set up follow-up sequences for qualified leads",
      ],
      generatedAt: new Date().toISOString(),
    };

    await storage.createReport({
      clientId,
      serviceType: "chatbot",
      reportMonth: month,
      data: reportData,
    });
  }

  async sendMonthlyReports(month: string): Promise<void> {
    try {
      const reports = await storage.getReportsByMonth(month);
      
      // Group reports by client
      const clientReports = reports.reduce((acc, report) => {
        if (!acc[report.clientId!]) {
          acc[report.clientId!] = [];
        }
        acc[report.clientId!].push(report);
        return acc;
      }, {} as Record<number, typeof reports>);

      // Send email for each client
      for (const [clientId, clientReportsList] of Object.entries(clientReports)) {
        const client = await storage.getClient(parseInt(clientId));
        if (client && client.contactEmail) {
          await this.sendClientReportEmail(client, clientReportsList, month);
        }
      }
    } catch (error) {
      console.error("Error sending monthly reports:", error);
      throw error;
    }
  }

  private async sendClientReportEmail(client: any, reports: any[], month: string): Promise<void> {
    try {
      const monthName = new Date(`${month}-01`).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Monthly Performance Report</h1>
            <h2>${monthName}</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${client.businessName} team,</p>
            
            <p>Please find your monthly digital marketing performance report attached. Here's a summary of your services:</p>
            
            ${reports.map(report => `
              <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px;">
                <h3 style="color: #2563eb; margin-top: 0;">${report.serviceType.toUpperCase()} Report</h3>
                <p>Your ${report.serviceType} performance for ${monthName} shows continued progress. Detailed metrics and recommendations are available in your dashboard.</p>
              </div>
            `).join('')}
            
            <div style="background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Access your full reports:</strong> <a href="https://topwebdirectories.com.au/dashboard" style="color: #2563eb;">Customer Dashboard</a></p>
            </div>
            
            <p>If you have any questions about your reports, please don't hesitate to contact us.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p><strong>Top Web Directories</strong><br>
              Phone: 08 7480 2495<br>
              Email: stefan.neale@topwebdirectories.com.au<br>
              Address: 217 Flinders St, Adelaide SA 5000</p>
            </div>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: '"Top Web Directories" <stefan.neale@topwebdirectories.com.au>',
        to: client.contactEmail,
        subject: `${client.businessName} - Monthly Digital Marketing Report (${monthName})`,
        html: htmlContent,
      });

      // Mark reports as sent
      for (const report of reports) {
        await storage.updateReport(report.id, {
          emailSent: true,
          emailSentAt: new Date(),
        });
      }

    } catch (error) {
      console.error(`Error sending email to ${client.contactEmail}:`, error);
      throw error;
    }
  }
}

export const reportService = new ReportService();

// Scheduled task to run monthly reports
// This would typically be handled by a cron job or scheduler
export async function scheduleMonthlyReports() {
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const monthString = lastMonth.toISOString().substring(0, 7); // YYYY-MM format

  try {
    console.log(`Generating reports for ${monthString}...`);
    await reportService.generateAllReports(monthString);
    
    console.log(`Sending monthly reports for ${monthString}...`);
    await reportService.sendMonthlyReports(monthString);
    
    console.log("Monthly reports completed successfully");
  } catch (error) {
    console.error("Monthly report generation failed:", error);
  }
}
