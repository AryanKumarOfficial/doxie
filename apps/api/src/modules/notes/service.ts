import { prisma, Prisma } from '@doxie/db';

export class NotesService {
  async getNotes(userId: string, filters: {
    folder?: string;
    tag?: string;
    searchQuery?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    isPublic?: boolean;
    skip?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const { folder, tag, searchQuery, isFavorite, isPinned, isPublic, skip = 0, limit = 50, sortBy = 'updatedAt' } = filters;

    const where: Prisma.NoteWhereInput = {
      userId,
    };

    if (folder) where.folder = folder;
    // Prisma array filtering for tags. "has" checks if the array contains the value.
    if (tag) where.tags = { has: tag };

    if (isFavorite !== undefined) where.isFavorite = isFavorite;
    if (isPinned !== undefined) where.isPinned = isPinned;
    if (isPublic !== undefined) where.isPublic = isPublic;

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
        // Searching inside array of strings in Prisma is tricky with simple contains,
        // but 'has' is for exact match. For partial match in array, it's harder in Postgres/Prisma without raw query.
        // We'll skip tag partial search for now or rely on exact tag filter.
      ];
    }

    const orderBy: Prisma.NoteOrderByWithRelationInput = {};
    if (sortBy === 'title') orderBy.title = 'asc';
    else if (sortBy === 'createdAt') orderBy.createdAt = 'desc';
    else if (sortBy === 'updatedAt') orderBy.updatedAt = 'desc';
    else orderBy.updatedAt = 'desc';

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.note.count({ where })
    ]);

    return {
      notes,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createNote(userId: string, data: {
    title: string;
    content?: string;
    tags?: string[];
    folder?: string;
    color?: string;
    isPinned?: boolean;
    isFavorite?: boolean;
    isPublic?: boolean;
    editorType?: string;
  }) {
    return prisma.note.create({
      data: {
        ...data,
        userId,
      }
    });
  }

  async getNote(userId: string, noteId: string) {
    return prisma.note.findUnique({
      where: {
        id: noteId,
        userId // Ensure ownership
      }
    });
  }

  async updateNote(userId: string, noteId: string, data: Partial<Prisma.NoteCreateInput>) {
    // First check existence and ownership
    const exists = await prisma.note.findUnique({
      where: { id: noteId, userId }
    });

    if (!exists) throw new Error('Note not found or access denied');

    return prisma.note.update({
      where: { id: noteId },
      data
    });
  }

  async deleteNote(userId: string, noteId: string) {
    const exists = await prisma.note.findUnique({
      where: { id: noteId, userId }
    });

    if (!exists) throw new Error('Note not found or access denied');

    return prisma.note.delete({
      where: { id: noteId }
    });
  }
}
