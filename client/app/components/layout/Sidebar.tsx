'use client';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Project Overview & Architecture', icon: '🏗️', href: '/' },
  { label: 'Main Project', icon: '🚀', href: '/assignments', badge: null },
];

export default function Sidebar({ assignmentCount }: { assignmentCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">V</div>
        <span>VedaAI</span>
      </div>
      <button className="sidebar-create-btn" onClick={() => router.push('/assignments/create')}>
        <span className="sparkle">✦</span> Create Assignment
      </button>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive =
            item.href === '/assignments'
              ? pathname.startsWith('/assignments')
              : pathname === item.href;
          const badge = item.label === 'Assignments' && assignmentCount
            ? String(assignmentCount)
            : item.badge;
          return (
            <a
              key={item.label}
              className={`nav-item${isActive ? ' active' : ''}`}
              href={item.href}
              onClick={(e) => { e.preventDefault(); router.push(item.href); }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {badge && <span className="nav-badge">{badge}</span>}
            </a>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-settings">
          <span>⚙️</span> Settings
        </div>
        <div className="sidebar-school">
          <div className="school-avatar">🏫</div>
          <div className="school-info">
            <strong>Delhi Public School</strong>
            <span>Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
