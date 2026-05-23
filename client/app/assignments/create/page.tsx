'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { QUESTION_TYPE_OPTIONS } from '../../types';

export default function CreateAssignmentPage() {
  useWebSocket();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    file, dueDate, title, subject, className, questionTypes, additionalInfo,
    setFile, setDueDate, setTitle, setSubject, setClassName,
    setAdditionalInfo, addQuestionType, removeQuestionType,
    updateQuestionType, submitAssignment, isLoading,
  } = useAssignmentStore();

  const totalQ = questionTypes.reduce((a, q) => a + q.count, 0);
  const totalM = questionTypes.reduce((a, q) => a + q.count * q.marks, 0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, [setFile]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!dueDate) e.dueDate = 'Due date is required';
    if (questionTypes.length === 0) e.qt = 'Add at least one question type';
    questionTypes.forEach((q, i) => {
      if (q.count < 1) e[`qt_count_${i}`] = 'Min 1';
      if (q.marks < 1) e[`qt_marks_${i}`] = 'Min 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const id = await submitAssignment();
      router.push(`/assignments/${id}`);
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div className="green-dot" />
          <h1>Create Assignment</h1>
        </div>
        <p>Set up a new assignment for your students</p>
      </div>

      <div className="create-progress">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: '50%' }} />
        </div>
      </div>

      <div className="form-card">
        <h2>Assignment Details</h2>
        <p className="form-subtitle">Basic information about your assignment</p>

        {/* Title & Subject Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label className="form-label">Title *</label>
            <input
              className={`qt-select${errors.title ? ' input-error' : ''}`}
              placeholder="e.g. Quiz on Electricity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%' }}
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>
          <div>
            <label className="form-label">Subject</label>
            <input className="qt-select" placeholder="e.g. Science" value={subject}
              onChange={(e) => setSubject(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label className="form-label">Class</label>
            <input className="qt-select" placeholder="e.g. 5th" value={className}
              onChange={(e) => setClassName(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        {/* File Upload */}
        <div
          className={`file-upload-zone${dragOver ? ' drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">☁️</div>
          <div className="upload-text">Choose a file or drag &amp; drop it here</div>
          <div className="upload-hint">JPEG, PNG, upto 10MB</div>
          <button className="browse-btn" type="button" onClick={(e) => e.stopPropagation()}>
            Browse Files
          </button>
          <input ref={fileInputRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
        </div>
        <p className="upload-caption">Upload images of your preferred document/image</p>

        {file && (
          <div className="file-selected">
            📎 {file.name}
            <button className="remove-file" onClick={() => setFile(null)}>×</button>
          </div>
        )}

        {/* Due Date */}
        <label className="form-label">Due Date</label>
        <div className="date-input-wrap">
          <input
            type="date"
            className={errors.dueDate ? 'input-error' : ''}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="DD-MM-YYYY"
          />
          {errors.dueDate && <div className="field-error">{errors.dueDate}</div>}
        </div>

        {/* Question Types */}
        <div className="qt-header">
          <span>Question Type</span>
          <span></span>
          <span>No. of Questions</span>
          <span>Marks</span>
        </div>
        {questionTypes.map((qt, i) => (
          <div className="qt-row" key={i}>
            <div className="qt-select-wrap">
              <select className="qt-select" value={qt.type}
                onChange={(e) => updateQuestionType(i, 'type', e.target.value)}>
                {QUESTION_TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <button className="qt-remove" onClick={() => removeQuestionType(i)}>✕</button>
            </div>
            <div />
            <div className={`counter${qt.count > 0 ? ' active' : ''}`}>
              <button onClick={() => updateQuestionType(i, 'count', Math.max(1, qt.count - 1))}>−</button>
              <span className="counter-val">{qt.count}</span>
              <button onClick={() => updateQuestionType(i, 'count', qt.count + 1)}>+</button>
            </div>
            <div className={`counter${qt.marks > 0 ? ' active' : ''}`}>
              <button onClick={() => updateQuestionType(i, 'marks', Math.max(1, qt.marks - 1))}>−</button>
              <span className="counter-val">{qt.marks}</span>
              <button onClick={() => updateQuestionType(i, 'marks', qt.marks + 1)}>+</button>
            </div>
          </div>
        ))}
        <button className="add-qt-btn" onClick={addQuestionType}>
          <span className="plus-icon">+</span> Add Question Type
        </button>
        <div className="qt-totals">
          Total Questions : <strong>{totalQ}</strong><br />
          Total Marks : <strong>{totalM}</strong>
        </div>

        {/* Additional Info */}
        <div className="additional-wrap">
          <label className="form-label">Additional Information (For better output)</label>
          <textarea
            className="additional-textarea"
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
          <div className="textarea-footer"><span className="mic-btn">🎙️</span></div>
        </div>

        {errors.submit && <div className="field-error" style={{ marginBottom: 12 }}>{errors.submit}</div>}
      </div>

      {/* Nav Buttons */}
      <div className="form-nav">
        <button className="btn-prev" onClick={() => router.back()}>← Previous</button>
        <button className="btn-next" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Next →'}
        </button>
      </div>
    </>
  );
}
