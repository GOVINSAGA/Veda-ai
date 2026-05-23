import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { generationQueue } from '../jobs/queue';
import { getRedisClient } from '../config/redis';
import { generatePDF } from '../services/pdf.service';

// Create a new assignment and enqueue generation job
export async function createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      subject,
      className,
      school,
      dueDate,
      questionTypes,
      additionalInstructions,
      totalQuestions,
      totalMarks,
    } = req.body;

    const assignment = new Assignment({
      title,
      subject: subject || 'General',
      className: className || '5th',
      school: school || 'Delhi Public School, Sector-4, Bokaro',
      dueDate: new Date(dueDate),
      questionTypes,
      additionalInstructions,
      totalQuestions,
      totalMarks,
      status: 'pending',
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      fileName: req.file ? req.file.originalname : undefined,
    });

    await assignment.save();

    // Enqueue job
    await generationQueue.add('generate', {
      assignmentId: assignment._id.toString(),
    });

    // Cache initial status
    const redis = getRedisClient();
    await redis.set(`job:${assignment._id}:status`, 'pending', 'EX', 3600);

    res.status(201).json({
      message: 'Assignment created successfully. Question paper generation started.',
      assignment: {
        id: assignment._id,
        title: assignment.title,
        status: assignment.status,
        createdAt: assignment.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create assignment' });
  }
}

// Get all assignments
export async function getAssignments(_req: Request, res: Response): Promise<void> {
  try {
    const assignments = await Assignment.find()
      .select('-generatedPaper')
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch assignments' });
  }
}

// Get single assignment with generated paper
export async function getAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Try Redis cache first
    const redis = getRedisClient();
    const cached = await redis.get(`assignment:${id}`);
    if (cached) {
      const assignment = JSON.parse(cached);
      if (assignment.status === 'completed') {
        res.json({ assignment, fromCache: true });
        return;
      }
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Cache if completed
    if (assignment.status === 'completed') {
      await redis.set(`assignment:${id}`, JSON.stringify(assignment.toObject()), 'EX', 3600);
    }

    res.json({ assignment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch assignment' });
  }
}

// Delete assignment
export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Clear cache
    const redis = getRedisClient();
    await redis.del(`assignment:${id}`, `job:${id}:status`);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete assignment' });
  }
}

// Regenerate question paper
export async function regenerateAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Reset status
    assignment.status = 'pending';
    assignment.generatedPaper = undefined;
    assignment.errorMessage = undefined;
    await assignment.save();

    // Enqueue new job
    await generationQueue.add('generate', {
      assignmentId: id,
    });

    // Clear cache
    const redis = getRedisClient();
    await redis.del(`assignment:${id}`);
    await redis.set(`job:${id}:status`, 'pending', 'EX', 3600);

    res.json({ message: 'Regeneration started', assignmentId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to regenerate' });
  }
}

// Download PDF
export async function downloadPDF(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (!assignment.generatedPaper) {
      res.status(400).json({ error: 'Question paper not generated yet' });
      return;
    }

    const pdfBuffer = await generatePDF(assignment.generatedPaper);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_question_paper.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate PDF' });
  }
}

// Get job status
export async function getJobStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const redis = getRedisClient();
    const status = await redis.get(`job:${id}:status`);
    res.json({ assignmentId: id, status: status || 'unknown' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
