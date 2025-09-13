import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

// Fix: Adhering to the coding guidelines, the API key must be obtained exclusively from process.env.API_KEY.
// This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // Fix: Updated error message to comply with guidelines, which prohibit instructing users on how to set the API key.
  throw new Error(
    "API_KEY environment variable is not defined."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A detailed description of the outfit, including items, style, and colors.",
    },
    accessories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 suggested matching accessories like bags, jewelry, scarves, etc.",
    },
    footwear: {
      type: Type.STRING,
      description: "A recommendation for suitable footwear that matches the outfit's style.",
    },
    hairstyle: {
      type: Type.STRING,
      description: "A recommendation for a hairstyle that complements the outfit and overall look.",
    },
    caption: {
      type: Type.STRING,
      description: "A fun, witty, and short Instagram-style caption for a photo of this outfit. Include 2-3 relevant hashtags.",
    },
    occasion: {
      type: Type.STRING,
      description: "The best type of occasion to wear this outfit to (e.g., Casual brunch, Formal event, Night out, Work meeting).",
    },
    styleSuggestions: {
        type: Type.ARRAY,
        description: "A list of 4-5 generic style components from the outfit (e.g., 'Men's Black Slim-Fit Shirt') with a brief, encouraging description for each.",
        items: {
            type: Type.OBJECT,
            properties: {
                itemName: {
                    type: Type.STRING,
                    description: "The generic name of the clothing item or accessory type."
                },
                description: {
                    type: Type.STRING,
                    description: "A brief, one-sentence description of the item and its role in the outfit."
                }
            },
            required: ["itemName", "description"]
        }
    },
    recommendations: {
        type: Type.ARRAY,
        description: "A list of 5 to 8 specific, purchasable clothing or accessory items similar to those in the outfit, found from popular e-commerce sites.",
        items: {
            type: Type.OBJECT,
            properties: {
                productName: {
                    type: Type.STRING,
                    description: "The full name of the specific, purchasable product (e.g., 'Nike Air Force 1 '07')."
                },
                productImageURL: {
                    type: Type.STRING,
                    description: "A direct, public URL to an image of the product. This URL must directly render an image file (e.g., end in .jpg, .png, .webp)."
                },
                price: {
                    type: Type.STRING,
                    description: "The estimated price of the product as a string, including the appropriate currency symbol (e.g., '₹899' for India, '$89.99' for global)."
                },
                buyLink: {
                    type: Type.STRING,
                    description: "A complete, direct URL to the product's purchase page on a major e-commerce website."
                }
            },
            required: ["productName", "productImageURL", "price", "buyLink"]
        }
    }
  },
  required: ["description", "accessories", "footwear", "hairstyle", "caption", "occasion", "styleSuggestions", "recommendations"],
};

export async function analyzeOutfit(base64ImageData: string, mimeType: string, isIndia: boolean): Promise<AnalysisResult> {
  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  const locationSpecificInstructions = isIndia
    ? `The user is in India. You MUST find 5 to 8 specific, purchasable items from ONLY Amazon.in and Myntra. Prioritize these two stores. Do not use other retailers. For each item, provide its full name, a direct URL to a high-quality product image (this must be a link to the image file, not a webpage), an accurate, current price in Indian Rupees (INR, format '₹X,XXX'), and a direct link to the product page on either Amazon.in or Myntra.`
    : `The user is not in India. You MUST find 5 to 8 specific, purchasable items from popular global online retailers that ship internationally (e.g., Amazon, ASOS, Zara, H&M). For each item, provide its full name, a direct URL to a high-quality product image (this must be a link to the image file, not a webpage), an accurate, current price in a major currency like USD or EUR (e.g., '$89.99' or '€79.99'), and a direct link to the product page.`;

  const systemInstruction = "You are a world-class fashion stylist and expert personal shopper. Your goal is to analyze a user's outfit and provide detailed, helpful, and actionable fashion advice, including specific product recommendations. You must strictly adhere to the provided JSON schema for your output.";

  const userPrompt = `Analyze the outfit in this image. 
1. Provide a general style analysis (description, accessories, footwear, hairstyle, caption, occasion).
2. Provide a list of 4-5 generic style components and their descriptions.
3. Act as a personal shopper based on the user's location and provide specific, purchasable recommendations. ${locationSpecificInstructions}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: userPrompt }] },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    const jsonText = response.text.trim();
    let result;

    try {
        result = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON response from AI:", jsonText);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
    

    // Basic validation to ensure the response is not completely empty
    if (!result.description || !Array.isArray(result.styleSuggestions)) {
      throw new Error("AI response is missing key fields.");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
            throw new Error("The image could not be processed due to safety settings. Please try a different image.");
        }
        if (error.message.includes('UNAUTHENTICATED') || error.message.includes('401')) {
            throw new Error("Authentication failed. Please check if your API key is correct and valid.");
        }
        // Re-throw specific errors to be displayed to the user
        if (error.message.includes("invalid response format")) {
            throw error;
        }
    }
    throw new Error("Failed to get fashion analysis from AI. Please try again.");
  }
}