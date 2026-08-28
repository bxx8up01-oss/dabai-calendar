import { useEvents } from '@/contexts/event-context';
import type { ICalendarEvent } from '@/data/calendar';
import { QUADRANT_LABELS, CATEGORY_LABELS } from '@/data/calendar';
import { Clock, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  currentDate: Date;
  events: ICalendarEvent[];
}

const quadrantColors: Record<string, string> = {
  'urgent-important': 'border-l-red-500 bg-red-50',
  'important-not-urgent': 'border-l-amber-500 bg-amber-50',
  'urgent-not-important': 'border-l-blue-500 bg-blue-50',
  'not-urgent-not-important': 'border-l-green-500 bg-green-50',
};

export function DayView({ currentDate, events }: Props) {
  const { openEditDialog, toggleComplete } = useEvents();

  const dayEvents = events
    .filter((e) => {
      const d = new Date(e.startTime);
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth() && d.getDate() === currentDate.getDate();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月{currentDate.getDate()}日
        </h2>
        <p className="text-sm text-muted-foreground mt-1">共 {dayEvents.length} 个事项</p>
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {dayEvents.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p>今天没有安排事项</p>
          </div>
        ) : (
          dayEvents.map((e) => (
            <div
              key={e.id}
              className={`p-4 border-l-4 ${quadrantColors[e.quadrant]} ${e.isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(e.id, !e.isCompleted)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {e.isCompleted ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`font-medium ${e.isCompleted ? 'line-through' : ''}`}
                      onClick={() => openEditDialog(e)}
                    >
                      {e.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background border">
                      {CATEGORY_LABELS[e.category]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background border flex items-center gap-1">
                      <Tag size={10} />
                      {QUADRANT_LABELS[e.quadrant]}
                    </span>
                    {e.isCountdown && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                        <AlertCircle size={10} />
                        倒计时
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(e.startTime).toTimeString().slice(0, 5)} - {new Date(e.endTime).toTimeString().slice(0, 5)}
                    </span>
                  </div>
                  {e.note && (
                    <p className="mt-2 text-sm text-muted-foreground">{e.note}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
