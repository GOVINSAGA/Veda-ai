export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface Question {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questionType: string;
  questions: Question[];
}

export interface GeneratedPaper {
  school: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  school: string;
  fileUrl?: string;
  fileName?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  totalQuestions: number;
  totalMarks: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False Questions',
  'Fill in the Blanks',
  'Match the Following',
];
