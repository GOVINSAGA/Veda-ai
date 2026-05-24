'use client';
import { useRouter } from 'next/navigation';

export default function MobileHeader() {
  const router = useRouter();
  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        <div className="logo-icon">V</div>
        <span className="mobile-header-title">VedaAI</span>
      </div>
      <div className="mobile-header-right">
        <div className="topbar-notif">
          🔔<div className="dot" />
        </div>
        <div className="topbar-user">
          <div className="avatar">👤</div>
        </div>
        <button className="mobile-hamburger" aria-label="Menu">☰</button>
      </div>
    </header>
  );
}
