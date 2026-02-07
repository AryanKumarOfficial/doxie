import { prisma } from '@doxie/db';
import { aiQueue } from './queue';
import { ServiceResponse } from '../../common/response';

export class AIService {
  async generateText(prompt: string, userId: string, organizationId?: string, provider = 'gemini', model?: string) {
    // Create Job
    const jobRecord = await prisma.aIJob.create({
        data: {
            type: 'text-generation',
            status: 'pending',
            input: { prompt },
            userId
        }
    });

    // Add to Queue
    await aiQueue.add('generate-text', {
        id: jobRecord.id,
        prompt,
        provider,
        model,
        userId,
        organizationId
    });

    return ServiceResponse.success('AI Job created', { jobId: jobRecord.id });
  }

  async getJobStatus(jobId: string) {
      const job = await prisma.aIJob.findUnique({ where: { id: jobId } });
      return ServiceResponse.success('Job status', job);
  }
}
