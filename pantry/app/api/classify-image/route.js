import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",  // Updated to use gpt-4o
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What items do you see in this image? Please provide a list of up to 5 tags describing the contents, focusing on food items if present." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const tags = response.choices[0].message.content
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error classifying image:', error);
    return NextResponse.json({ error: 'Error classifying image', details: error.message }, { status: 500 });
  }
}
