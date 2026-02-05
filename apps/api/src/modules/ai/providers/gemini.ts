import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { AIProvider } from './index';
import { env } from '../../../config/env';

export class GeminiProvider implements AIProvider {
  private google: any;

  constructor() {
    if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
        this.google = createGoogleGenerativeAI({
            apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
        });
    }
  }

  async generateText(prompt: string, model = 'gemini-1.5-pro-latest') {
    if (!this.google) {
        throw new Error('Google Generative AI API Key not configured');
    }

    const { text, usage } = await generateText({
      model: this.google(model),
      prompt,
    });

    return {
      text,
      usage: {
        inputTokens: (usage as any).promptTokens || 0,
        outputTokens: (usage as any).completionTokens || 0,
        totalTokens: (usage as any).totalTokens || 0,
      },
    };
  }
}
