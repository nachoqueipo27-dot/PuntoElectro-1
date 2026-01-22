
import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
    // 1. Image Generation: "Visualize Project"
    async generateConceptImage(prompt: string, aspectRatio: string, size: string): Promise<string | null> {
        try {
            // Using gemini-3-pro-image-preview
            const response = await ai.models.generateContent({
                model: GeminiModel.IMAGE_GEN_PRO,
                contents: prompt,
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any, // '1:1' | '16:9' etc
                        imageSize: size as any // '1K' | '2K' | '4K'
                    }
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            return null;
        } catch (error) {
            console.error("Gemini Image Gen Error:", error);
            return null;
        }
    },

    // 2. Image Editing: "Edit Context" (Nano Banana)
    async editImage(base64Image: string, prompt: string): Promise<string | null> {
        // Remove header if present
        const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        try {
            const response = await ai.models.generateContent({
                model: GeminiModel.IMAGE_EDIT_FLASH,
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Data
                            }
                        },
                        { text: prompt }
                    ]
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            return null;
        } catch (error) {
            console.error("Gemini Edit Error:", error);
            return null;
        }
    }
};
