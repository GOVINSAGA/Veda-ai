'use client';
import { create } from 'zustand';
import { Assignment, QuestionType } from '../types';
import { api } from '../lib/api';

interface AssignmentState {
  /* Form */
  file: File | null;
  dueDate: string;
  title: string;
  subject: string;
  className: string;
  questionTypes: QuestionType[];
  additionalInfo: string;
  /* List */
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  /* UI */
  isLoading: boolean;
  generationStatus: 'idle' | 'processing' | 'completed' | 'failed';
  searchQuery: string;
  /* Actions */
  setFile: (f: File | null) => void;
  setDueDate: (d: string) => void;
  setTitle: (t: string) => void;
  setSubject: (s: string) => void;
  setClassName: (c: string) => void;
  setAdditionalInfo: (i: string) => void;
  setSearchQuery: (q: string) => void;
  addQuestionType: () => void;
  removeQuestionType: (i: number) => void;
  updateQuestionType: (i: number, field: keyof QuestionType, value: string | number) => void;
  resetForm: () => void;
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  submitAssignment: () => Promise<string>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<void>;
  setGenerationStatus: (s: 'idle' | 'processing' | 'completed' | 'failed') => void;
  setCurrentAssignment: (a: Assignment | null) => void;
}

const defaultQT: QuestionType[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
  { type: 'Short Questions', count: 3, marks: 2 },
];

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  file: null,
  dueDate: '',
  title: '',
  subject: '',
  className: '',
  questionTypes: [...defaultQT],
  additionalInfo: '',
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  generationStatus: 'idle',
  searchQuery: '',

  setFile: (f) => set({ file: f }),
  setDueDate: (d) => set({ dueDate: d }),
  setTitle: (t) => set({ title: t }),
  setSubject: (s) => set({ subject: s }),
  setClassName: (c) => set({ className: c }),
  setAdditionalInfo: (i) => set({ additionalInfo: i }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setGenerationStatus: (s) => set({ generationStatus: s }),
  setCurrentAssignment: (a) => set({ currentAssignment: a }),

  addQuestionType: () =>
    set((s) => ({
      questionTypes: [...s.questionTypes, { type: 'Long Answer Questions', count: 1, marks: 1 }],
    })),

  removeQuestionType: (i) =>
    set((s) => ({ questionTypes: s.questionTypes.filter((_, idx) => idx !== i) })),

  updateQuestionType: (i, field, value) =>
    set((s) => {
      const qt = [...s.questionTypes];
      (qt[i] as any)[field] = value;
      return { questionTypes: qt };
    }),

  resetForm: () =>
    set({
      file: null,
      dueDate: '',
      title: '',
      subject: '',
      className: '',
      questionTypes: [...defaultQT],
      additionalInfo: '',
    }),

  fetchAssignments: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getAssignments();
      set({ assignments: data.assignments });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAssignment: async (id) => {
    set({ isLoading: true });
    try {
      const data = await api.getAssignment(id);
      set({ currentAssignment: data.assignment });
    } finally {
      set({ isLoading: false });
    }
  },

  submitAssignment: async () => {
    const s = get();
    const fd = new FormData();
    fd.append('title', s.title || 'Untitled Assignment');
    fd.append('subject', s.subject || 'General');
    fd.append('className', s.className || '5th');
    fd.append('dueDate', s.dueDate || new Date().toISOString());
    fd.append('questionTypes', JSON.stringify(s.questionTypes));
    fd.append('additionalInstructions', s.additionalInfo);
    fd.append('totalQuestions', String(s.questionTypes.reduce((a, q) => a + q.count, 0)));
    fd.append('totalMarks', String(s.questionTypes.reduce((a, q) => a + q.count * q.marks, 0)));
    if (s.file) fd.append('file', s.file);
    set({ isLoading: true, generationStatus: 'processing' });
    try {
      const data = await api.createAssignment(fd);
      return data.assignment.id;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAssignment: async (id) => {
    await api.deleteAssignment(id);
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) }));
  },

  regenerate: async (id) => {
    set({ generationStatus: 'processing' });
    await api.regenerateAssignment(id);
  },
}));
