import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function classifyImageWithGemini(imageUrl) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "What items do you see in this image? Please provide a list of up to 5 tags describing the contents, focusing on food items if present.";

  try {
    const result = await model.generateContent([prompt, { inlineData: { data: await fetchImageAsBase64(imageUrl), mimeType: "image/jpeg" } }]);
    const response = await result.response;
    const text = response.text();
    return text.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
  } catch (error) {
    console.error("Error classifying image with Gemini:", error);
    throw error;
  }
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return base64;
}
