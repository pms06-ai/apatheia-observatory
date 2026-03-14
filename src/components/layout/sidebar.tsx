'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  Scale,
  Frame,
  GitCompareArrows,
  FileText,
  BookOpen,
  Library,
  ArrowLeftRight,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/actors', label: 'Actors', icon: Users },
  { href: '/accountability', label: 'Accountability', icon: Scale },
  { href: '/framing', label: 'Framing Analysis', icon: Frame },
  { href: '/contradictions', label: 'Contradictions', icon: GitCompareArrows },
  { href: '/evidence', label: 'Evidence', icon: FileText },
  { href: '/themes', label: 'Themes', icon: Tags },
  { href: '/explainers', label: 'Explainers', icon: BookOpen },
  { href: '/sources', label: 'Sources', icon: Library },
  { href: '/bias', label: 'Bias Spectrum', icon: ArrowLeftRight },
  { href: '/blind-spots', label: 'Blind Spots', icon: EyeOff },
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
      <div className="flex items-center gap-3 border-b border-line px-3 py-5">
        {!collapsed && (
          <div className="transition-opacity duration-150">
            <h1 className="font-serif text-lg font-semibold text-gold">
              Apatheia
            </h1>
            <p className="text-xs text-text-faint">Political Observatory</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-text-faint hover:text-text-primary transition-colors duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-text-muted hover:bg-charcoal-850 hover:text-text-primary'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="transition-opacity duration-150">
                  {item.label}
                </span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                {link}
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-line px-3 py-3 transition-opacity duration-150">
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
