import { useState } from 'react';
import { useEvents } from '@/contexts/event-context';
import { useCategoryFilter } from '@/hooks/use-view-pref';
import { QUADRANT_LABELS, CATEGORY_LABELS } from '@/data/calendar';
import type { QuadrantType, ICalendarEvent } from '@/data/calendar';
import { Plus, Clock, CheckCircle2 } from 'lucide-react';

const quadrants: { key: QuadrantType; label: string; color: string; bg: string; border: string }[] = [
  { key: 'urgent-important', label: '重要且紧急', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  { key: 'important-not-urgent', label: '重要不紧急', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'urgent-not-important', label: '紧急不重要', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'not-urgent-not-important', label: '不紧急不重要', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
];

export default function QuadrantPage() {
  const { events, openAddDialog, openEditDialog, toggleComplete } = useEvents();
  const { filter, setFilter } = useCategoryFilter();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredEvents = events.filter((e) => {
    if (filter !== 'all' && e.category !== filter) return false;
    if (statusFilter === 'active' && e.isCompleted) return false;
    if (statusFilter === 'completed' && !e.isCompleted) return false;
    return true;
  });

  const getEventsForQuadrant = (q: QuadrantType) =>
    filteredEvents
      .filter((e) => e.quadrant === q)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const EventCard = ({ e }: { e: ICalendarEvent }) => (
    <div
      className={`p-3 rounded-lg border bg-white cursor-pointer hover:shadow-sm transition-shadow ${e.isCompleted ? 'opacity-60' : ''}`}
      onClick={() => openEditDialog(e)}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={(ev) => { ev.stopPropagation(); toggleComplete(e.id, !e.isCompleted); }}
          className="mt-0.5 flex-shrink-0"
        >
          {e.isCompleted ? <CheckCircle2 size={18} className="text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${e.isCompleted ? 'line-through' : ''}`}>{e.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5"><Clock size={12} />{new Date(e.startTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} {new Date(e.startTime).toTimeString().slice(0, 5)}</span>
            <span className="px-1.5 py-0.5 rounded bg-gray-100">{CATEGORY_LABELS[e.category]}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">四象限看板</h1>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q) => {
          const qEvents = getEventsForQuadrant(q.key);
          return (
            <div key={q.key} className={`rounded-xl border-2 ${q.border} ${q.bg} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${q.color}`}>{q.label}</h3>
                <span className={`text-sm ${q.color}`}>{qEvents.length}</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {qEvents.length === 0 ? (
                  <button
                    onClick={() => openAddDialog(q.key)}
                    className="w-full p-4 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:bg-white/50 flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> 添加事项
                  </button>
                ) : (
                  <>
                    {qEvents.map((e) => <EventCard key={e.id} e={e} />)}
                    <button
                      onClick={() => openAddDialog(q.key)}
                      className="w-full p-2 text-xs text-muted-foreground hover:bg-white/50 rounded flex items-center justify-center gap-1"
                    >
                      <Plus size={14} /> 添加
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
