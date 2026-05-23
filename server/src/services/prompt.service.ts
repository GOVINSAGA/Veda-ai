import { IQuestionType } from '../models/Assignment';

export interface PromptInput {
  title: string;
  subject: string;
  className: string;
  school: string;
  questionTypes: IQuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
}

export function buildPrompt(input: PromptInput): string {
  const questionTypeDescriptions = input.questionTypes
    .map(
      (qt) =>
        `- ${qt.type}: ${qt.count} questions, each worth ${qt.marks} marks`
    )
    .join('\n');

  const sectionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const sectionMapping = input.questionTypes
    .map((qt, i) => `Section ${sectionLabels[i]}: ${qt.type}`)
    .join(', ');

  return `You are an expert exam paper creator for ${input.school}.
Generate a structured question paper for the following:

Subject: ${input.subject}
Class: ${input.className}
Title: ${input.title}
Total Questions: ${input.totalQuestions}
Total Marks: ${input.totalMarks}

Question Types:
${questionTypeDescriptions}

Sections: ${sectionMapping}

${input.additionalInstructions ? `Additional Instructions: ${input.additionalInstructions}` : ''}

IMPORTANT: You MUST respond with ONLY valid JSON. No explanation, no markdown, no code fences. Just the raw JSON object.

The JSON must follow this EXACT structure:
{
  "timeAllowed": "45 minutes",
  "maxMarks": ${input.totalMarks},
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questionType": "Short Answer Questions",
      "questions": [
        {
          "number": 1,
          "text": "The question text here",
          "difficulty": "Easy",
          "marks": 2,
          "answer": "A concise model answer"
        }
      ]
    }
  ]
}

Rules:
1. Each section corresponds to one question type in order
2. The "difficulty" field must be exactly one of: "Easy", "Moderate", "Challenging"
3. Distribute difficulty across questions: roughly 40% Easy, 40% Moderate, 20% Challenging
4. Each question must have a clear, well-formed answer
5. Questions should be appropriate for ${input.className} level students
6. The total marks across all sections must equal ${input.totalMarks}
7. The total number of questions must equal ${input.totalQuestions}
8. Make questions educationally sound and relevant to the subject
9. Return ONLY the JSON object, nothing else`;
}
