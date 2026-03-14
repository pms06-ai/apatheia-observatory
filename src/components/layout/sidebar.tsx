'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Overview', icon: '◈' },
  { href: '/actors', label: 'Actors', icon: '◉' },
  { href: '/accountability', label: 'Accountability', icon: '⊕' },
  { href: '/framing', label: 'Framing Analysis', icon: '⊘' },
  { href: '/contradictions', label: 'Contradictions', icon: '⟁' },
  { href: '/evidence', label: 'Evidence', icon: '▤' },
  { href: '/explainers', label: 'Explainers', icon: '◎' },
  { href: '/sources', label: 'Sources', icon: '◫' },
  { href: '/bias', label: 'Bias Spectrum', icon: '⟷' },
  { href: '/blind-spots', label: 'Blind Spots', icon: '◌' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-line bg-bg-secondary transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-5">
        {!collapsed && (
          <div>
            <h1 className="font-serif text-lg font-semibold text-gold">
              Apatheia
            </h1>
            <p className="text-xs text-text-faint">Political Observatory</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-text-faint hover:text-text-primary transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▸' : '◂'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-muted hover:bg-charcoal-850 hover:text-text-primary'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-line px-4 py-3">
          <p className="text-xs text-text-faint">Iran War 2026</p>
          <p className="text-xs text-text-faint">
            <kbd className="rounded bg-charcoal-800 px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>{' '}
            to search
          </p>
        </div>
      )}
    </aside>
  );
}
