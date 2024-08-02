import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request) {
  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "What item do you see in this image? Please respond in one word";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: await fetchImageAsBase64(imageUrl), mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    const text = response.text();
    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error classifying image:', error);
    return NextResponse.json({ error: 'Error classifying image', details: error.message }, { status: 500 });
  }
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return base64;
}
