'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { useWebSocket } from '../hooks/useWebSocket';

export default function AssignmentsPage() {
  useWebSocket();
  const router = useRouter();
  const { assignments, isLoading, fetchAssignments, deleteAssignment, searchQuery, setSearchQuery } =
    useAssignmentStore();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  if (isLoading && assignments.length === 0) {
    return (
      <div className="processing-state">
        <div className="spinner" />
        <p>Loading assignments...</p>
      </div>
    );
  }

  // Empty State (SS3)
  if (assignments.length === 0) {
    return (
      <>
        <div className="page-header">
          <div className="page-header-row">
            <div className="green-dot" />
            <h1>Assignments</h1>
          </div>
          <p>Manage and create assignments for your classes.</p>
        </div>
        <div className="empty-state">
          <div className="empty-illustration">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="#f0f0f0"/>
              <rect x="60" y="50" width="80" height="100" rx="8" fill="#fff" stroke="#ddd" strokeWidth="2"/>
              <line x1="75" y1="72" x2="125" y2="72" stroke="#ccc" strokeWidth="3" strokeLinecap="round"/>
              <line x1="75" y1="85" x2="115" y2="85" stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round"/>
              <line x1="75" y1="95" x2="120" y2="95" stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round"/>
              <line x1="75" y1="105" x2="105" y2="105" stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="130" cy="120" r="30" fill="#f5f5f5" stroke="#ddd" strokeWidth="2"/>
              <line x1="150" y1="142" x2="165" y2="157" stroke="#ccc" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="130" cy="118" r="10" fill="none" stroke="#ef4444" strokeWidth="2"/>
              <line x1="124" y1="118" x2="136" y2="118" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>No assignments yet</h2>
          <p>
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let AI
            assist with grading.
          </p>
          <button className="empty-state-btn" onClick={() => router.push('/assignments/create')}>
            + Create Your First Assignment
          </button>
        </div>
      </>
    );
  }

  // Populated State (SS2)
  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div className="green-dot" />
          <h1>Assignments</h1>
        </div>
        <p>Manage and create assignments for your classes.</p>
      </div>

      <div className="filter-bar">
        <button className="filter-btn">🔽 Filter By</button>
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="assignments-grid">
        {filtered.map((a) => (
          <div key={a._id} className="assignment-card" onClick={() => {
            if (a.status === 'completed') router.push(`/assignments/${a._id}`);
          }}>
            <h3>{a.title}</h3>
            <div className="card-dates">
              <span><strong>Assigned on</strong> : {formatDate(a.createdAt)}</span>
              <span><strong>Due</strong> : {formatDate(a.dueDate)}</span>
            </div>
            {a.status === 'processing' && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-orange)' }}>
                ⏳ Generating...
              </div>
            )}
            <button className="card-menu-btn" onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(menuOpen === a._id ? null : a._id);
            }}>⋮</button>
            {menuOpen === a._id && (
              <div className="card-context-menu">
                <button onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(null);
                  if (a.status === 'completed') router.push(`/assignments/${a._id}`);
                }}>View Assignment</button>
                <button className="delete-btn" onClick={async (e) => {
                  e.stopPropagation();
                  setMenuOpen(null);
                  await deleteAssignment(a._id);
                }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="floating-create-btn" onClick={() => router.push('/assignments/create')}>
        + Create Assignment
      </button>
    </>
  );
}
