import { useState } from 'react';
import { useViewPref, useCategoryFilter, useStatusFilter } from '@/hooks/use-view-pref';
import { useEvents } from '@/contexts/event-context';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const { view, setView } = useViewPref();
  const { filter, setFilter } = useCategoryFilter();
  const { statusFilter, setStatusFilter } = useStatusFilter();
  const { events, loading } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());

  const goPrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const getTitle = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    if (view === 'month') return `${y}年${m}月`;
    if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
    }
    return `${y}年${m}月${currentDate.getDate()}日`;
  };

  const filteredEvents = events.filter((e) => {
    if (filter !== 'all' && e.category !== filter) return false;
    if (statusFilter === 'active' && e.isCompleted) return false;
    if (statusFilter === 'completed' && !e.isCompleted) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-2 hover:bg-accent rounded-md"><ChevronLeft size={18} /></button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent flex items-center gap-1">
            <CalendarIcon size={14} /> 今天
          </button>
          <button onClick={goNext} className="p-2 hover:bg-accent rounded-md"><ChevronRight size={18} /></button>
          <h1 className="text-xl font-semibold ml-2">{getTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                {v === 'month' ? '月' : v === 'week' ? '周' : '日'}
              </button>
            ))}
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-1.5 text-sm border rounded-md bg-background">
            <option value="all">全部板块</option>
            <option value="work">工作</option>
            <option value="life">生活</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-1.5 text-sm border rounded-md bg-background">
            <option value="all">全部状态</option>
            <option value="active">未完成</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">加载中...</div>
      ) : view === 'month' ? (
        <MonthView currentDate={currentDate} events={filteredEvents} />
      ) : view === 'week' ? (
        <WeekView currentDate={currentDate} events={filteredEvents} />
      ) : (
        <DayView currentDate={currentDate} events={filteredEvents} />
      )}
    </div>
  );
}
