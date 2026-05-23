import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  regenerateAssignment,
  downloadPDF,
  getJobStatus,
} from '../controllers/assignment.controller';
import { upload } from '../middleware/upload';
import { validateCreateAssignment } from '../middleware/validation';

const router = Router();

// POST /api/assignments - Create new assignment with optional file
router.post('/', upload.single('file'), validateCreateAssignment, createAssignment);

// GET /api/assignments - List all assignments
router.get('/', getAssignments);

// GET /api/assignments/:id - Get single assignment
router.get('/:id', getAssignment);

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', deleteAssignment);

// POST /api/assignments/:id/regenerate - Regenerate paper
router.post('/:id/regenerate', regenerateAssignment);

// GET /api/assignments/:id/pdf - Download PDF
router.get('/:id/pdf', downloadPDF);

// GET /api/assignments/:id/status - Get job status
router.get('/:id/status', getJobStatus);

export default router;
