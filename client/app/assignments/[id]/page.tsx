'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { api } from '../../lib/api';

export default function ViewAssignmentPage() {
  useWebSocket();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentAssignment, fetchAssignment, isLoading, generationStatus, regenerate } =
    useAssignmentStore();

  useEffect(() => { if (id) fetchAssignment(id); }, [id, fetchAssignment]);

  // Re-fetch when generation completes via websocket
  useEffect(() => {
    if (generationStatus === 'completed' && id) fetchAssignment(id);
  }, [generationStatus, id, fetchAssignment]);

  if (isLoading && !currentAssignment) {
    return (
      <div className="processing-state">
        <div className="spinner" />
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (!currentAssignment) {
    return <div className="processing-state"><p>Assignment not found</p></div>;
  }

  const a = currentAssignment;

  // Processing / Pending state
  if (a.status === 'processing' || a.status === 'pending') {
    return (
      <div className="processing-state">
        <div className="spinner" />
        <h2 style={{ marginBottom: 8 }}>Generating Question Paper...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Our AI is creating your customized question paper. This may take a moment.
        </p>
      </div>
    );
  }

  if (a.status === 'failed') {
    return (
      <div className="processing-state">
        <p style={{ color: 'var(--accent-red)', marginBottom: 16 }}>
          ❌ Generation failed: {a.errorMessage || 'Unknown error'}
        </p>
        <button className="btn-next" onClick={() => regenerate(id)}>🔄 Retry</button>
      </div>
    );
  }

  const paper = a.generatedPaper;
  if (!paper) {
    return <div className="processing-state"><p>No generated paper available</p></div>;
  }

  return (
    <>
      {/* Banner */}
      <div className="paper-banner">
        <p>
          Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade{' '}
          {paper.className || '8'} {paper.subject || 'Science'} classes on the NCERT chapters:
        </p>
        <a href={api.getPdfUrl(id)} className="pdf-download-btn" download>
          📥 Download as PDF
        </a>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="regen-btn" onClick={() => regenerate(id)}>🔄 Regenerate</button>
        <button className="btn-prev" onClick={() => router.push('/assignments')}>
          ← Back to Assignments
        </button>
      </div>

      {/* Question Paper */}
      <div className="paper-container">
        <div className="paper-school">{paper.school}</div>
        <div className="paper-sub">Subject: {paper.subject}</div>
        <div className="paper-class">Class: {paper.className}</div>

        <div className="paper-meta">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.maxMarks}</span>
        </div>

        <div className="paper-instruction">
          All questions are compulsory unless stated otherwise.
        </div>

        <div className="paper-student-info">
          Name: <span>&nbsp;</span><br />
          Roll Number: <span>&nbsp;</span><br />
          Class: {paper.className} Section: <span>&nbsp;</span>
        </div>

        {paper.sections.map((section, si) => (
          <div key={si} className="paper-section">
            <div className="paper-section-title">{section.title}</div>
            <div className="paper-section-type">{section.questionType}</div>
            <div className="paper-section-inst">{section.instruction}</div>
            {section.questions.map((q, qi) => (
              <div key={qi} className="paper-question">
                {q.number}. <span className={`diff-tag diff-${q.difficulty}`}>[{q.difficulty}]</span>{' '}
                {q.text} <span className="marks-tag">[{q.marks} Marks]</span>
              </div>
            ))}
          </div>
        ))}

        <div className="paper-end">End of Question Paper</div>

        {/* Answer Key */}
        <div className="answer-key">
          <h3>Answer Key:</h3>
          {paper.sections.map((section) =>
            section.questions.map((q) => (
              <div key={q.number} className="answer-item">
                {q.number}. {q.answer || 'Answer not available'}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
