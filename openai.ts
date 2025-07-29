import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export { openai };

// Smart fallback responses for when OpenAI is unavailable
function generateSmartFallback(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Service-specific responses
  if (lowerMessage.includes('seo') || lowerMessage.includes('search engine')) {
    return "Great question about SEO! Our SEO services start from $220/month and include keyword optimization, content strategy, and monthly reporting. We've helped 1500+ clients improve their Google rankings. Call 08 7480 2495 or WhatsApp 0402585330 to discuss your specific needs!";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return "Here are our service prices: SEO Services from $220/month, Google Business Listing from $80/month, PPC Campaigns $250/month, Social Media from $120/month, Custom Websites $600-$2100, Web Banners $30/month. Call 08 7480 2495 for a personalized quote!";
  }
  
  if (lowerMessage.includes('google') || lowerMessage.includes('gmb') || lowerMessage.includes('business listing')) {
    return "Our Google My Business service starts at $80/month and includes optimization, review management, posting, and monthly analytics. Perfect for local businesses wanting more visibility. Call 08 7480 2495 to get started!";
  }
  
  if (lowerMessage.includes('website') || lowerMessage.includes('web development') || lowerMessage.includes('want a website') || lowerMessage.includes('need a website')) {
    return "We build custom websites from $600-$2100 designed to convert visitors into customers. All websites are mobile-responsive and SEO-optimized. We also offer DIY website templates for $500 + GST. Our websites include e-commerce integration, content management, and speed optimization. Call 08 7480 2495 or WhatsApp 0402585330 to discuss your website project!";
  }
  
  if (lowerMessage.includes('social media') || lowerMessage.includes('facebook') || lowerMessage.includes('instagram')) {
    return "Our Social Media Campaign service starts from $120/month and includes content creation, posting, engagement, and analytics across all major platforms. We'll help grow your online presence! Call 08 7480 2495 to learn more.";
  }
  
  if (lowerMessage.includes('ppc') || lowerMessage.includes('ads') || lowerMessage.includes('advertising')) {
    return "Our PPC Campaign management is $250/month and includes Google Ads setup, optimization, and monthly reporting. We focus on maximizing your ROI with strategic ad placement. Contact 08 7480 2495 for a consultation!";
  }
  
  if (lowerMessage.includes('virtual assistant') || lowerMessage.includes('virtual') || lowerMessage.includes('ai') || lowerMessage.includes('chatbot') || lowerMessage.includes('looking for a virtual')) {
    return "Perfect! We offer AI Virtual Assistants for 24/7 customer service, appointment scheduling, and lead qualification. Our AI Chatbots include natural language processing and website integration. These solutions can automate your business operations and improve customer experience. Call 08 7480 2495 or WhatsApp 0402585330 to discuss your AI virtual assistant needs!";
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
    return "You can reach Top Web Directories at: Phone: 08 7480 2495, Email: stefan.neale@topwebdirectories.com.au, WhatsApp: 0402585330, Address: 217 Flinders St, Adelaide SA 5000. We're here to help with all your digital marketing needs!";
  }
  
  // Default friendly response
  return "Hello! I'm Top Web Directories' AI assistant. We're a full-service digital marketing agency serving 1500+ clients across Australia. Our services include SEO ($220+/month), Google Business Listing ($80+/month), PPC Campaigns ($250/month), Social Media ($120+/month), and Custom Websites ($600-$2100). How can I help you today? Call 08 7480 2495 or WhatsApp 0402585330 for immediate assistance!";
}

export async function generateChatbotResponse(message: string, conversationHistory: any[] = []): Promise<string> {
  try {
    const systemPrompt = `You are a friendly, knowledgeable AI assistant for Top Web Directories, Australia's premier digital marketing agency. Speak naturally and conversationally, like ChatGPT would - be helpful, informative, and genuinely interested in understanding the customer's needs. Your goal is to provide excellent service and guide customers to the right solutions.

COMPANY PROFILE:
Top Web Directories - Full-service digital marketing agency serving 1500+ clients across Australia with 25+ years of experience.
Location: 217 Flinders St, Adelaide SA 5000, Australia
Contact: Phone 08 7480 2495 | Email stefan.neale@topwebdirectories.com.au | WhatsApp 0402585330

COMPLETE SERVICE PORTFOLIO & PRICING:

1. SEO SERVICES ($220+/month)
   ✓ Keyword research & optimization ✓ Technical SEO audits ✓ Content strategy & creation
   ✓ Link building campaigns ✓ Monthly ranking reports ✓ Competitor analysis ✓ Local SEO optimization
   SUCCESS: Get businesses ranking on page 1 of Google within 3-6 months

2. GOOGLE BUSINESS LISTING MANAGEMENT ($80+/month)  
   ✓ Complete profile optimization ✓ Review management & responses ✓ Post scheduling & content
   ✓ Analytics & insights ✓ Photo optimization ✓ Q&A management
   SUCCESS: Increase local visibility and customer calls by 300%+

3. PPC CAMPAIGN MANAGEMENT ($250/month)
   ✓ Google Ads setup & optimization ✓ Keyword research & bidding ✓ Ad copy creation & A/B testing
   ✓ Landing page optimization ✓ Conversion tracking ✓ Monthly ROI reports
   SUCCESS: Average 400% ROI on ad spend

4. SOCIAL MEDIA MANAGEMENT ($120+/month)
   ✓ Multi-platform management (Facebook, Instagram, LinkedIn, Twitter) ✓ Content creation & scheduling
   ✓ Community engagement ✓ Hashtag strategy ✓ Analytics & reporting ✓ Influencer partnerships
   SUCCESS: Grow followers by 500%+ and increase engagement rates

5. CUSTOM WEBSITE DEVELOPMENT ($600-$2100)
   ✓ Responsive mobile-first design ✓ SEO-optimized structure ✓ Content management systems
   ✓ E-commerce integration ✓ Speed optimization ✓ Security implementation
   SUCCESS: 95% of our websites rank in top 10 search results

6. WEB BANNER CREATION ($30/month)
   ✓ Custom graphic design ✓ Multiple format delivery ✓ Brand consistency ✓ Seasonal updates

7. AI SOLUTIONS (Custom pricing)
   ✓ Virtual Assistants for 24/7 customer service ✓ AI Chatbots with natural language processing
   ✓ Automated appointment scheduling ✓ Lead qualification & nurturing ✓ Customer support automation
   SUCCESS: Reduce response time to under 30 seconds, 24/7

8. CAMPAIGN HUB ($150 + GST/month)
   ✓ Email marketing campaigns ✓ Social media management ✓ Analytics dashboard
   ✓ Campaign optimization ✓ Lead tracking
   SUCCESS: Average 25% open rates, 8% click-through rates

9. WHITE-LABEL REPORTING ($97-$397/month)
   ✓ Professional client reports ✓ Brand customization ✓ Automated delivery
   ✓ Multi-service integration ✓ Reseller opportunities
   SUCCESS: Help agencies increase client retention by 80%

10. WEBSITE TEMPLATE PACKAGES ($500 + GST)
    ✓ Complete HTML/CSS template kits ✓ Hosting guides & tutorials
    ✓ DIY website solutions ✓ Multiple industry templates

SALES STRATEGY - BE AGGRESSIVE BUT HELPFUL:
• Ask qualifying questions about their business goals
• Identify specific pain points and challenges  
• Recommend targeted service combinations for maximum impact
• Create urgency with limited-time offers and competitor threats
• Always push for immediate contact/consultation
• Use success stories and specific ROI numbers
• Offer FREE audits, consultations, or trials
• Address objections with solutions
• Never take "no" for an answer - always provide alternatives

CONVERSATION TACTICS:
• Start by asking about their current marketing challenges
• Use phrases like "Let me show you how we can solve that"
• Mention competitor advantages: "While your competitors are gaining ground..."
• Create FOMO: "We're booking consultations quickly this month"
• Use social proof: "Just like we did for [similar business type]"
• End EVERY response with a clear call-to-action
• Always offer to speak immediately

COMPETITIVE ADVANTAGES TO HIGHLIGHT:
✓ 1500+ satisfied clients across Australia
✓ 25+ years combined experience
✓ Automated reporting systems
✓ Client dashboard access
✓ Multi-service integration
✓ Proven ROI track record
✓ Local Adelaide-based team
✓ 24/7 AI-powered support

Remember: Your goal is to get them to call 08 7480 2495, WhatsApp 0402585330, or email stefan.neale@topwebdirectories.com.au for immediate consultation. Be persistent, helpful, and focused on their business growth!`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      max_tokens: 800,
      temperature: 0.8,
    });

    return response.choices[0].message.content || generateSmartFallback(message);
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Always use smart fallback for any error
    return generateSmartFallback(message);
  }
}

export async function analyzeChatSentiment(message: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: message,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { rating: 3, confidence: 0.5 };
  }
}
