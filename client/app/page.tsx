'use client';

export default function Home() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div className="page-header-row">
          <h1>Project Overview & Architecture</h1>
          <div className="green-dot"></div>
          <p>System Status: Active & Deployed</p>
        </div>
        <p style={{ marginLeft: 0, marginTop: '8px', fontSize: '15px', maxWidth: '800px', lineHeight: '1.6' }}>
          Welcome to VedaAI. This page provides a high-level technical overview of the system architecture, 
          infrastructure, and how the core AI pipeline operates asynchronously behind the scenes.
        </p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
          Tech Stack & Architecture
        </h2>
        <div className="assignments-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          
          <div className="assignment-card" style={{ cursor: 'default' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎨</span> Frontend
            </h3>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
              <li><strong>Next.js 16</strong> (App Router)</li>
              <li><strong>Zustand</strong> (Global state)</li>
              <li><strong>Vanilla CSS</strong> (Pixel-perfect to Figma)</li>
              <li>Responsive Layouts</li>
            </ul>
          </div>

          <div className="assignment-card" style={{ cursor: 'default' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚙️</span> Backend Core
            </h3>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
              <li><strong>Node.js / Express</strong> (REST API)</li>
              <li><strong>TypeScript</strong> (Strict typing)</li>
              <li><strong>BullMQ</strong> (Background queues)</li>
              <li><strong>PDFKit</strong> (Document generation)</li>
            </ul>
          </div>

          <div className="assignment-card" style={{ cursor: 'default' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>💾</span> Data Layer
            </h3>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
              <li><strong>MongoDB / Mongoose</strong> (Persistence)</li>
              <li><strong>Redis</strong> (Caching & Queue state)</li>
              <li>Structured Schema validation</li>
            </ul>
          </div>

          <div className="assignment-card" style={{ cursor: 'default' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span> AI Integration
            </h3>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
              <li><strong>NVIDIA Llama 3.1 API</strong></li>
              <li>Strict JSON schema prompting</li>
              <li>Multi-section difficulty scaling</li>
              <li>Automated fallback parsing</li>
            </ul>
          </div>

          <div className="assignment-card" style={{ cursor: 'default' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span> Real-time
            </h3>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
              <li><strong>WebSockets (ws)</strong></li>
              <li>Live job status broadcasting</li>
              <li>Client-side auto-reconnection</li>
              <li>Immediate UI updates</li>
            </ul>
          </div>

          <div className="assignment-card" style={{ cursor: 'default' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>☁️</span> Infrastructure
            </h3>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
              <li><strong>OCI VM</strong> (Oracle Cloud)</li>
              <li><strong>Docker Compose</strong> (Containerized)</li>
              <li><strong>Nginx + Certbot</strong> (HTTPS Proxy)</li>
              <li><strong>GitHub Actions</strong> (CI/CD to GHCR)</li>
            </ul>
          </div>

        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
          How it Works (The Generation Pipeline)
        </h2>
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <ol style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '2' }}>
            <li><strong>Submission:</strong> The user submits a form on the <strong style={{ color: 'var(--text-primary)' }}>Main Project</strong> tab with their required question types, difficulty, and PDF syllabus.</li>
            <li><strong>API Ingestion:</strong> The Express API receives the request, stores an initial "Pending" record in MongoDB, and adds the generation task to a Redis-backed <strong>BullMQ</strong> queue.</li>
            <li><strong>Background Processing:</strong> A dedicated worker picks up the job. It uses prompt engineering to instruct the <strong>NVIDIA Llama 3.1</strong> model to output curriculum-aligned questions in a strict, parsable JSON format.</li>
            <li><strong>Real-time Notification:</strong> While the AI is generating, the server pushes WebSocket events to the client to indicate processing state. Once finished, a "Completed" WebSocket event is fired.</li>
            <li><strong>Rendering & Export:</strong> The client receives the event, queries the database for the finalized JSON structure, and renders it pixel-perfectly. The user can then export this beautifully rendered layout directly to PDF.</li>
          </ol>
        </div>
      </div>

    </div>
  );
}
