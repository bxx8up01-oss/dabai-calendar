import { useEvents } from '@/contexts/event-context';
import type { ICalendarEvent } from '@/data/calendar';
import { QUADRANT_LABELS } from '@/data/calendar';

interface Props {
  currentDate: Date;
  events: ICalendarEvent[];
}

const quadrantColors: Record<string, string> = {
  'urgent-important': 'bg-red-100 text-red-800 border-red-300',
  'important-not-urgent': 'bg-amber-100 text-amber-800 border-amber-300',
  'urgent-not-important': 'bg-blue-100 text-blue-800 border-blue-300',
  'not-urgent-not-important': 'bg-green-100 text-green-800 border-green-300',
};

export function WeekView({ currentDate, events }: Props) {
  const { openEditDialog } = useEvents();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const today = new Date();

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const getEventsForDay = (date: Date) => {
    return events
      .filter((e) => {
        const d = new Date(e.startTime);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const isToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {days.map((d, i) => (
          <div key={i} className={`py-3 text-center border-r last:border-r-0 ${isToday(d) ? 'bg-primary/10' : ''}`}>
            <div className="text-xs text-muted-foreground">{weekdays[i]}</div>
            <div className={`text-lg font-semibold mt-1 ${isToday(d) ? 'text-primary' : ''}`}>{d.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[500px]">
        {days.map((d, i) => (
          <div key={i} className="p-2 border-r last:border-r-0 space-y-1.5">
            {getEventsForDay(d).map((e) => (
              <button
                key={e.id}
                onClick={() => openEditDialog(e)}
                className={`w-full text-left text-xs p-2 rounded border ${quadrantColors[e.quadrant]} ${e.isCompleted ? 'opacity-50 line-through' : ''}`}
              >
                <div className="font-medium">{new Date(e.startTime).toTimeString().slice(0, 5)}</div>
                <div className="truncate mt-0.5">{e.title}</div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
