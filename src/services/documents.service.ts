import { prisma } from "@/lib/prisma";

export async function createDocument(orgId: string, ownerId: string, title = "Untitled") {
    return prisma.document.create({ data: { title, orgId, ownerId } });
}


export async function listDocuments(orgId: string, limit = 50, offset = 0) {
    return prisma.document.findMany({ where: { orgId }, take: limit, skip: offset, orderBy: { updatedAt: "desc" } });
}


export async function getDocument(id: string) {
    return prisma.document.findUnique({ where: { id } });
}


export async function saveRevision(documentId: string, snapshot: any, createdBy?: string) {
    return prisma.documentRevision.create({ data: { documentId, snapshot, createdBy } });
}