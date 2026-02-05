
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Correctly initialized GoogleGenAI with a named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async analyzeAuditProgress(tasks: any[]): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following audit tasks and provide a professional Arabic summary for the General Director. Highlight risks and recommended actions. Tasks: ${JSON.stringify(tasks)}`,
        config: {
          systemInstruction: "You are an expert internal audit AI assistant for the Madinah Regional Municipality. Your output must be professional, in Arabic, and actionable."
        }
      });
      // Correctly accessing the text property (it is a getter, not a method)
      return response.text || "لم يتم التمكن من تحليل البيانات حالياً.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "حدث خطأ أثناء تحليل البيانات ذكياً.";
    }
  },

  async suggestAwarenessMessage(topic: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional awareness message in Arabic for municipality employees about the topic: ${topic}. Include a title and a clear message body.`,
      });
      // Correctly accessing the text property
      return response.text || "";
    } catch (error) {
      return "فشل إنشاء الرسالة.";
    }
  }
};
