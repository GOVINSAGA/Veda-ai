import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface IQuestion {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  answer?: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questionType: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  school: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: ISection[];
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  school: string;
  fileUrl?: string;
  fileName?: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  additionalInstructions?: string;
  totalQuestions: number;
  totalMarks: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper?: IGeneratedPaper;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const QuestionSchema = new Schema<IQuestion>({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true },
  answer: { type: String },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questionType: { type: String, required: true },
  questions: [QuestionSchema],
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  school: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  sections: [SectionSchema],
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, default: 'General' },
    className: { type: String, default: '5th' },
    school: { type: String, default: 'Delhi Public School, Sector-4, Bokaro' },
    fileUrl: { type: String },
    fileName: { type: String },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInstructions: { type: String },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: { type: GeneratedPaperSchema },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
