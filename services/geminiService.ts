import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to remove the data URL prefix if present
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 0. Pre-check: Validate if the image is suitable for analysis
export const validateImage = async (base64Image: string): Promise<{ isValid: boolean; reason?: string }> => {
  const modelId = "gemini-2.5-flash"; // Fast model for validation
  
  const prompt = `
    Task: Validate if this image is suitable for a professional facial aesthetic analysis app.
    
    Checklist:
    1. Face Detection: Is there at least one clear human face?
    2. Obstruction: Are the eyes, nose, and mouth visible? (Small glasses are okay, large masks or hands covering features are not).
    3. Image Quality: Is the resolution high enough to see facial details?
    4. Content: Is it a real photo (not a cartoon, drawing, or animal)?

    Return JSON:
    {
      "isValid": boolean, // true if it passes all checks
      "reason": string | null // If false, provide a polite explanation in Simplified Chinese. e.g. "无法检测到清晰的人脸", "面部遮挡过多，请移除口罩或手遮挡", "图片过于模糊", "请上传真实人物照片"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING, nullable: true }
          },
          required: ["isValid"]
        }
      }
    });

    const text = response.text;
    if (!text) return { isValid: false, reason: "无法验证图片" };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Validation Error:", error);
    // If blocked by safety filters or other errors, assume invalid
    return { isValid: false, reason: "图片无法识别或包含不安全内容" };
  }
};

// 1. Optimize the image to be a frontal ID photo or specific angle
export const optimizePortrait = async (base64Image: string, angle: 'frontal' | 'side45' | 'side90' = 'frontal'): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  let angleInstruction = "Fix the head angle to be perfectly straight and frontal (facing the camera directly).";
  let cropInstruction = "Portrait crop showing head and shoulders.";
  
  if (angle === 'side45') {
    angleInstruction = "Fix the head angle to be a 3/4 view or 45-degree side profile. The face should be clearly visible but turned slightly.";
  } else if (angle === 'side90') {
    angleInstruction = "Fix the head angle to be a perfect 90-degree side profile (medical profile view). Focus on the silhouette of the nose, chin, and jawline.";
  }

  const prompt = `
    Task: Transform this image into a high-quality, professional, medical-aesthetic standard portrait.
    
    Strict Requirements:
    1. Orientation: ${angleInstruction}
    2. Obstructions: REMOVE any sunglasses, glasses with reflections, face masks, hands touching the face, or messy hair covering the eyes/face/ears. The facial structure must be fully visible.
    3. Lighting: Apply soft, even studio lighting to eliminate harsh shadows.
    4. Identity: You MUST preserve the person's core facial features and identity. Do not change who they look like, just correct the angle, posture and styling.
    5. Background: Change background to a clean, soft off-white or light grey color.
    6. Crop: ${cropInstruction}
    
    Output: A clean, realistic photographic image suitable for aesthetic analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } },
          { text: prompt }
        ]
      },
      config: {
        // High creativity allowed to fix angles/remove objects, but kept realistic
        temperature: 0.4 
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("Failed to optimize portrait");
  } catch (error) {
    console.error("Optimization Error:", error);
    // If optimization fails, we throw to let the UI know
    throw new Error("AI人像矫正失败，请尝试更清晰的照片");
  }
};

// 2. Analyze the face to get JSON data for the charts
export const analyzeFaceMetrics = async (base64Image: string): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the facial aesthetics of the person in this image.
    Provide a professional assessment based on golden ratio, symmetry, and feature proportions.
    
    Return the response in strictly valid JSON format.
    
    The JSON structure must be:
    {
      "scores": {
        "eyes": number (0-100),
        "cheeks": number (0-100),
        "lips": number (0-100),
        "brows": number (0-100),
        "jawline": number (0-100),
        "symmetry": number (0-100),
        "total": number (0-100)
      },
      "summary": string (A concise, 2-sentence professional aesthetic summary in Simplified Chinese. Use warm, professional language like "照片中的人物" or "您" to refer to the person. Avoid cold terms like "该对象" or "此人".)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                eyes: { type: Type.NUMBER },
                cheeks: { type: Type.NUMBER },
                lips: { type: Type.NUMBER },
                brows: { type: Type.NUMBER },
                jawline: { type: Type.NUMBER },
                symmetry: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
              },
              required: ["eyes", "cheeks", "lips", "brows", "jawline", "symmetry", "total"]
            },
            summary: { type: Type.STRING }
          },
          required: ["scores", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis data received");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("面部数据分析失败");
  }
};

// 3. Generate the "Poster" image with overlays
export const generateAestheticPoster = async (base64Image: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image"; // Good for editing/overlay tasks

  const prompt = `
    You are a professional aesthetic imaging system. 
    Use the provided portrait photo as the base.
    DO NOT change the person's facial features, age, skin tone, or gender. Keep the face exactly as is.
    
    Your task is to overlay a clean, medical-grade infographic on top of the face to create a "Face Aesthetics Report".
    
    Style Requirements:
    - High-resolution vertical poster style.
    - Studio lighting, soft beige/neutral background if you need to extend borders, but keep the face original.
    - Advanced beauty clinic aesthetic: clean thin white lines and sans-serif text.
    
    Content Requirements (Overlay these on the face):
    - Draw fine white indicator lines pointing to specific areas.
    - Add labels in ENGLISH ONLY (to ensure text clarity and prevent garbled characters) with a percentage score (randomly generated realistic high scores between 80-99%):
      1. Eyes: "Eye Beauty - XX%"
      2. Cheeks: "Cheek Harmony - XX%"
      3. Lips: "Lip Shape - XX%"
      4. Brows: "Brow Design - XX%"
      5. Jaw: "Jawline Contour - XX%"
      6. Center Face: "Symmetry - XX%"
    
    - At the bottom center, place a prominent score: "Total Score: XX%".
    
    No other logos or watermark text. Just the medical infographic overlay.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } },
          { text: prompt },
        ],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image generated by the model.");

  } catch (error) {
    console.error("Image Gen Error:", error);
    throw new Error("美学报告海报生成失败");
  }
};