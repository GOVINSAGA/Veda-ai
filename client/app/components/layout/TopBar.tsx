'use client';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-back" onClick={() => router.back()}>←</button>
        <div className="topbar-breadcrumb">
          <span className="bc-icon">⊞</span>
          <span>Assignment</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-notif">
          🔔<div className="dot" />
        </div>
        <div className="topbar-user">
          <div className="avatar">👤</div>
          <span>John Doe</span>
          <span style={{ fontSize: 10 }}>▼</span>
        </div>
      </div>
    </header>
  );
}
