import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This should be set in your environment variables
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What items do you see in this image? Please provide a list of up to 5 tags describing the contents, focusing on food items if present." },
            { type: "image_url", image_url: imageUrl },
          ],
        },
      ],
    });

    const tags = response.choices[0].message.content
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    res.status(200).json({ tags });
  } catch (error) {
    console.error('Error classifying image:', error);
    res.status(500).json({ error: 'Error classifying image' });
  }
}
