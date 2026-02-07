import { Request, Response } from 'express';
import { NotesService } from './service';
import { z } from 'zod';

const notesService = new NotesService();

const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional(),
  color: z.string().optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  editorType: z.string().optional(),
});

export class NotesController {
  async getNotes(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        folder, tag, query, isFavorite, isPinned, isPublic,
        limit, skip, sort
      } = req.query;

      const result = await notesService.getNotes(userId, {
        folder: folder as string,
        tag: tag as string,
        searchQuery: query as string,
        isFavorite: isFavorite === 'true',
        isPinned: isPinned === 'true',
        isPublic: isPublic === 'true',
        limit: limit ? parseInt(limit as string) : 50,
        skip: skip ? parseInt(skip as string) : 0,
        sortBy: sort as string,
      });

      res.json(result);
    } catch (error) {
      console.error('Get Notes Error:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  async createNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const validation = createNoteSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
      }

      const note = await notesService.createNote(userId, validation.data);
      res.status(201).json({ message: 'Note created', data: note });
    } catch (error) {
      console.error('Create Note Error:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  }

  async getNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const note = await notesService.getNote(userId, id);

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  }

  async updateNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const note = await notesService.updateNote(userId, id, req.body);
      res.json(note);
    } catch (error: any) {
      if (error.message === 'Note not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update note' });
    }
  }

  async deleteNote(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await notesService.deleteNote(userId, id);
      res.json({ message: 'Note deleted' });
    } catch (error: any) {
      if (error.message === 'Note not found or access denied') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete note' });
    }
  }
}
