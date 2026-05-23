import { OpenAI } from 'openai';
import { config } from '../config/env';

const client = new OpenAI({
  apiKey: config.nvidiaApiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export interface AIGenerationResult {
  timeAllowed: string;
  maxMarks: number;
  sections: {
    title: string;
    instruction: string;
    questionType: string;
    questions: {
      number: number;
      text: string;
      difficulty: 'Easy' | 'Moderate' | 'Challenging';
      marks: number;
      answer?: string;
    }[];
  }[];
}

export async function generateQuestionPaper(prompt: string): Promise<AIGenerationResult> {
  let fullResponse = '';

  try {
    const completion = await client.chat.completions.create({
      model: 'nvidia/llama-3.1-nemotron-nano-vl-8b-v1',
      messages: [
        {
          role: 'system',
          content:
            'You are a precise question paper generator. You MUST respond with ONLY valid JSON. No markdown, no explanations, no code fences. Just the raw JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 4096,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
      }
    }

    // Clean up the response - remove markdown code fences if present
    let cleanedResponse = fullResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    // Parse JSON
    const parsed = JSON.parse(cleanedResponse) as AIGenerationResult;

    // Validate the structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid AI response: missing sections array');
    }

    for (const section of parsed.sections) {
      if (!section.questions || !Array.isArray(section.questions)) {
        throw new Error(`Invalid AI response: section "${section.title}" missing questions`);
      }
      for (const q of section.questions) {
        // Normalize difficulty
        if (!['Easy', 'Moderate', 'Challenging'].includes(q.difficulty)) {
          q.difficulty = 'Moderate';
        }
      }
    }

    return parsed;
  } catch (error: any) {
    console.error('AI Generation Error:', error.message);
    console.error('Raw Response:', fullResponse);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}
