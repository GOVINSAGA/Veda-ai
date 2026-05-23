import { Worker, Job } from 'bullmq';
import { createRedisConnection, getRedisClient } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { buildPrompt } from '../services/prompt.service';
import { generateQuestionPaper } from '../services/ai.service';
import { broadcastToClients } from '../websocket';

interface GenerationJobData {
  assignmentId: string;
}

export function startWorker(): void {
  const worker = new Worker<GenerationJobData>(
    'question-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      console.log(`🔄 Processing job for assignment: ${assignmentId}`);

      // Update status to processing
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      broadcastToClients({
        type: 'job:started',
        assignmentId,
        message: 'Generating question paper...',
      });

      // Update Redis cache
      const redis = getRedisClient();
      await redis.set(`job:${assignmentId}:status`, 'processing', 'EX', 3600);

      // Fetch assignment
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // Build prompt
      const prompt = buildPrompt({
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        school: assignment.school,
        questionTypes: assignment.questionTypes,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
        additionalInstructions: assignment.additionalInstructions,
      });

      // Send progress
      broadcastToClients({
        type: 'job:progress',
        assignmentId,
        progress: 30,
        message: 'Prompt prepared, calling AI...',
      });

      // Generate questions
      const generatedPaper = await generateQuestionPaper(prompt);

      // Send progress
      broadcastToClients({
        type: 'job:progress',
        assignmentId,
        progress: 80,
        message: 'AI response received, storing results...',
      });

      // Store result
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        generatedPaper: {
          school: assignment.school,
          subject: assignment.subject,
          className: assignment.className,
          ...generatedPaper,
        },
      });

      // Update Redis cache
      await redis.set(`job:${assignmentId}:status`, 'completed', 'EX', 3600);
      await redis.set(
        `assignment:${assignmentId}`,
        JSON.stringify({ ...assignment.toObject(), status: 'completed', generatedPaper }),
        'EX',
        3600
      );

      // Notify frontend
      broadcastToClients({
        type: 'job:completed',
        assignmentId,
        progress: 100,
        message: 'Question paper generated successfully!',
      });

      console.log(`✅ Job completed for assignment: ${assignmentId}`);
      return { success: true, assignmentId };
    },
    {
      connection: createRedisConnection(),
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    if (job) {
      const { assignmentId } = job.data;
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        errorMessage: err.message,
      });

      const redis = getRedisClient();
      await redis.set(`job:${assignmentId}:status`, 'failed', 'EX', 3600);

      broadcastToClients({
        type: 'job:failed',
        assignmentId,
        message: `Generation failed: ${err.message}`,
      });
    }
  });

  console.log('✅ BullMQ worker started');
}
