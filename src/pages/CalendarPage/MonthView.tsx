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

export function MonthView({ currentDate, events }: Props) {
  const { openEditDialog } = useEvents();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDay = (date: Date) => {
    return events.filter((e) => {
      const d = new Date(e.startTime);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });
  };

  const isToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  };

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((d) => (
          <div key={d} className="py-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => (
          <div
            key={idx}
            className={`min-h-[100px] p-1.5 border-r border-b last:border-r-0 ${date ? '' : 'bg-muted/30'}`}
          >
            {date && (
              <>
                <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {getEventsForDay(date).slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => openEditDialog(e)}
                      className={`w-full text-left text-xs px-1.5 py-1 rounded border truncate ${quadrantColors[e.quadrant]} ${e.isCompleted ? 'opacity-50 line-through' : ''}`}
                      title={`${e.title} - ${QUADRANT_LABELS[e.quadrant]}`}
                    >
                      {new Date(e.startTime).toTimeString().slice(0, 5)} {e.title}
                    </button>
                  ))}
                  {getEventsForDay(date).length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">+{getEventsForDay(date).length - 3} 更多</div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
