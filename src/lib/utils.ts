import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + '…';
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'high': return 'text-copper';
    case 'medium': return 'text-gold';
    case 'low': return 'text-steel';
    default: return 'text-text-muted';
  }
}

export function partyColor(party: string | null): string {
  switch (party) {
    case 'Democrat': return 'text-status-info';
    case 'Republican': return 'text-status-danger';
    case 'Independent': return 'text-steel';
    default: return 'text-text-muted';
  }
}

export function partyBgColor(party: string | null): string {
  switch (party) {
    case 'Democrat': return 'bg-status-info/20';
    case 'Republican': return 'bg-status-danger/20';
    case 'Independent': return 'bg-steel/20';
    default: return 'bg-charcoal-700/30';
  }
}
