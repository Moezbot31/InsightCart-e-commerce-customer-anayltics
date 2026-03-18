import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAIInstance() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[geminiService] GEMINI_API_KEY is missing!");
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getSegmentInsights(segments: any[], topProducts: any[]) {
  console.log("[geminiService] Generating segment insights...");
  
  // Clean segments to avoid passing too much data (like customerIds)
  const cleanedSegments = segments.map(s => ({
    name: s.name,
    description: s.description,
    count: s.count,
    avgRecency: s.avgRecency,
    avgFrequency: s.avgFrequency,
    avgMonetary: s.avgMonetary,
    revenue: s.revenue
  }));

  const prompt = `
    As a Senior Data Scientist and Marketing Strategist, analyze the following e-commerce segmentation data.
    
    Customer Segments (RFM Analysis):
    ${JSON.stringify(cleanedSegments, null, 2)}
    
    Top Performing Products:
    ${JSON.stringify(topProducts.slice(0, 5), null, 2)}
    
    Provide a professional executive summary including:
    1. **Strategic Overview**: High-level performance analysis.
    2. **Segment-Specific Strategies**: Targeted marketing actions for each group.
    3. **Product Recommendations**: How to leverage top products for specific segments.
    4. **Retention Roadmap**: Priority actions to reduce churn.
    
    Use a professional, data-driven tone. Format with clear headings and bullet points in Markdown.
  `;

  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    console.log("[geminiService] Successfully generated insights.");
    return response.text;
  } catch (error) {
    console.error("[geminiService] Error getting AI insights:", error);
    return "Unable to generate AI insights at this time. Please check your AI configuration.";
  }
}
