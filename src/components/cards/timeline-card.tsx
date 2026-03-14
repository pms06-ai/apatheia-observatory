import { formatDate } from '@/lib/utils';
import type { TimelineEvent } from '@/types';

export function TimelineCard({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-gold via-bronze via-steel to-gunmetal" />

      {events.map((event) => (
        <div key={`${event.date}-${event.title}`} className="relative flex gap-4 pb-6">
          <div className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-gold/60 bg-bg-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-faint">{formatDate(event.date)}</p>
            <h4 className="text-sm font-medium text-text-primary">
              {event.title}
            </h4>
            <p className="mt-0.5 text-xs text-text-muted">{event.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
