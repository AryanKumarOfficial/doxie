import { Queue, Worker } from 'bullmq';
import { redis } from '../../config/redis';
import { prisma } from '@doxie/db';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';

export const aiQueue = new Queue('ai-jobs', { connection: redis });

const gemini = new GeminiProvider();
const openai = new OpenAIProvider();

const worker = new Worker('ai-jobs', async (job) => {
    const { id, prompt, provider, model, userId, organizationId } = job.data;

    // Update Job Status
    await prisma.aIJob.update({
        where: { id },
        data: { status: 'processing' }
    });

    try {
        let result;
        if (provider === 'openai') {
            result = await openai.generateText(prompt, model);
        } else {
            result = await gemini.generateText(prompt, model);
        }

        // Calculate Cost (Mock)
        const totalTokens = result.usage.totalTokens || 0;
        const cost = (totalTokens * 0.0001); // Simplified

        await prisma.$transaction([
            prisma.aIJob.update({
                where: { id },
                data: {
                    status: 'completed',
                    output: result.text as any,
                    cost
                }
            }),
            prisma.aIUsage.create({
                data: {
                    userId,
                    organizationId,
                    provider,
                    model,
                    inputTokens: result.usage.inputTokens,
                    outputTokens: result.usage.outputTokens,
                    totalTokens: totalTokens,
                    cost,
                    jobId: id
                }
            })
        ]);

        return result;

    } catch (error: any) {
        await prisma.aIJob.update({
            where: { id },
            data: { status: 'failed', output: { error: error.message } }
        });
        throw error;
    }

}, { connection: redis });

worker.on('error', err => {
    console.error('AI Worker error:', err);
});
