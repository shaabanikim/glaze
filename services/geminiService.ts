import { GoogleGenAI, Type } from "@google/genai";
import { Product, Recommendation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (products: Product[]) => `
You are "GlowBot", a beauty consultant for the lipgloss brand "GLAZE". 
Your goal is to recommend the best lipgloss shade from the provided product list based on the user's input (either a text description or an image analysis).

The available products are:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, shade: p.shade, hex: p.hex })))}

Rules:
1. Only recommend products from this list.
2. Be trendy, friendly, and enthusiastic (Gen Z/Millennial friendly tone).
3. Briefly explain why the shade matches their skin tone or vibe.
4. Return the result in a specific JSON format.
`;

export const getRecommendation = async (
  userInput: string, 
  products: Product[],
  imageBase64?: string
): Promise<Recommendation> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or we could detect
          data: imageBase64
        }
      });
      parts.push({
        text: `Analyze this image (focus on skin tone, undertone, and overall makeup vibe) and recommend the best Glaze lipgloss shade. ${userInput ? `User extra notes: ${userInput}` : ''}`
      });
    } else {
      parts.push({
        text: `User description: "${userInput}". Recommend the best Glaze lipgloss shade.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: generateSystemInstruction(products),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productId: { type: Type.STRING, description: "The ID of the recommended product" },
            reasoning: { type: Type.STRING, description: "A short, fun explanation of why this shade works." }
          },
          required: ["productId", "reasoning"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const data = JSON.parse(jsonText) as Recommendation;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Sorry, our beauty bot is touching up its makeup. Please try again!");
  }
};