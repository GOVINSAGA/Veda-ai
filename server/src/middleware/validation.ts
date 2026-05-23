import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const questionTypeSchema = z.object({
  type: z.string().min(1, 'Question type is required'),
  count: z.number().int().min(1, 'Count must be at least 1'),
  marks: z.number().int().min(1, 'Marks must be at least 1'),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().optional(),
  className: z.string().optional(),
  school: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(questionTypeSchema).min(1, 'At least one question type is required'),
  additionalInstructions: z.string().optional(),
  totalQuestions: z.number().int().min(1, 'Total questions must be at least 1'),
  totalMarks: z.number().int().min(1, 'Total marks must be at least 1'),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export function validateCreateAssignment(req: Request, res: Response, next: NextFunction): void {
  try {
    // Parse body - question types might come as JSON string from FormData
    const body = { ...req.body };
    if (typeof body.questionTypes === 'string') {
      body.questionTypes = JSON.parse(body.questionTypes);
    }
    if (typeof body.totalQuestions === 'string') {
      body.totalQuestions = parseInt(body.totalQuestions, 10);
    }
    if (typeof body.totalMarks === 'string') {
      body.totalMarks = parseInt(body.totalMarks, 10);
    }

    const result = createAssignmentSchema.safeParse(body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
}
