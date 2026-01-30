import { prisma } from '@doxie/db';

export class UsageService {
  async trackUsage(organizationId: string, feature: string, amount: number) {
    return prisma.usage.create({
      data: {
        organizationId,
        feature,
        amount,
        periodStart: new Date(),
        periodEnd: new Date(),
      },
    });
  }

  async getUsage(organizationId: string, feature: string, from: Date, to: Date) {
    const usages = await prisma.usage.findMany({
      where: {
        organizationId,
        feature,
        periodStart: { gte: from },
        periodEnd: { lte: to },
      },
    });

    return usages.reduce((acc, curr) => acc + curr.amount, 0);
  }
}
