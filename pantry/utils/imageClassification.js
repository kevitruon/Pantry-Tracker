export const classifyImage = async (imageUrl) => {
  try {
    const response = await fetch('/api/classify-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to classify image');
    }

    const data = await response.json();
    return data.tags;
  } catch (error) {
    console.error("Error classifying image:", error);
    return [];
  }
};
