import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { AIProvider } from './index';
import { env } from '../../../config/env';

export class OpenAIProvider implements AIProvider {
  private openai: any;

  constructor() {
    if (env.OPENAI_API_KEY) {
        this.openai = createOpenAI({
            apiKey: env.OPENAI_API_KEY,
        });
    }
  }

  async generateText(prompt: string, model = 'gpt-4') {
    if (!this.openai) {
        throw new Error('OpenAI API Key not configured');
    }

    const { text, usage } = await generateText({
      model: this.openai(model),
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
