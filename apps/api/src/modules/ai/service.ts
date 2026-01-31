import { generateText } from 'ai';
import { defaultModel } from './client';
import { prisma } from '@doxie/db';

export class AIService {
  async generateText(prompt: string, userId: string, organizationId?: string) {
    const { text, usage } = await generateText({
      model: defaultModel,
      prompt,
    });

    const inputTokens = (usage as any).promptTokens || 0;
    const outputTokens = (usage as any).completionTokens || 0;
    const totalTokens = (usage as any).totalTokens || 0;

    // Estimate cost (Mock logic)
    const cost = (inputTokens * 0.0001) + (outputTokens * 0.0003);

    await prisma.aIUsage.create({
      data: {
        userId,
        organizationId,
        provider: 'google',
        model: 'gemini-1.5-pro',
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
      }
    });

    return text;
  }
}
