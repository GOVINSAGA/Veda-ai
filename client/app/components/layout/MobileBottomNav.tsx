'use client';
import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { label: 'Home', icon: '⊞', href: '/' },
  { label: 'Assignments', icon: '📄', href: '/assignments' },
  { label: 'Library', icon: '📚', href: '#' },
  { label: 'AI Toolkit', icon: '✦', href: '#' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/assignments'
            ? pathname.startsWith('/assignments')
            : pathname === tab.href;
        return (
          <button
            key={tab.label}
            className={`mobile-nav-tab${isActive ? ' active' : ''}`}
            onClick={() => router.push(tab.href)}
          >
            <span className="mobile-nav-icon">{tab.icon}</span>
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
