import { prisma } from '@doxie/db';

export class ServiceFactory {
  private static instance: ServiceFactory;

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public getPrisma() {
    return prisma;
  }
}
