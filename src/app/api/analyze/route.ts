import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const base64Image = image.split(',')[1] || image;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this snake image and provide the following information:\n1. Species identification (include confidence level from 0-100)\n2. Whether it's venomous\n3. Key identifying features\n4. Safety concerns\n5. Typical habitats and locations\n6. First aid steps if bitten (provide as an array of clear, complete steps very specific for the snake in the image)\n7. Key facts about this species (provide 5 interesting facts)\n8. Top 3 sources with their URLs\nFormat the response as a JSON object with these fields: species, confidence (number), venomous (true/false), features, safety_concerns, habitat, first_aid_steps (array of strings), interesting_facts (array of 5 strings), sources (array of objects with name and url properties). If the image does not contain a snake, respond with a simple message stating that."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    
    // Log the response for debugging
    console.log('OpenAI Response:', response.choices[0].message);

    const analysisResult = response.choices[0].message.content;
    console.log('Analysis Result:', analysisResult);

    const isJsonResponse = analysisResult?.includes('{') && analysisResult?.includes('}') || false;

    return NextResponse.json({
        success: true,
        content: analysisResult || '',  // Provide default empty string if null
        isSnakeImage: isJsonResponse
      });
      

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}