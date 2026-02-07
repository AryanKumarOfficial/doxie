import { Router } from 'express';
import { NotesController } from '../modules/notes/controller';

const router = Router();
const controller = new NotesController();

// Binding context to ensure 'this' works if methods use it,
// though my controller implementation uses 'notesService' closure variable mostly.
// But good practice.

router.get('/', controller.getNotes.bind(controller));
router.post('/', controller.createNote.bind(controller));
router.get('/:id', controller.getNote.bind(controller));
router.put('/:id', controller.updateNote.bind(controller));
router.delete('/:id', controller.deleteNote.bind(controller));

export default router;
