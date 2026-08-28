import { useState, useEffect } from 'react';
import { useEvents } from '@/contexts/event-context';
import { CATEGORY_LABELS, QUADRANT_LABELS } from '@/data/calendar';
import type { CategoryType, QuadrantType } from '@/data/calendar';
import { X, Trash2 } from 'lucide-react';

export function EventDialog() {
  const { dialogOpen, editingEvent, defaultQuadrant, closeDialog, addEvent, updateEvent, deleteEvent } = useEvents();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<CategoryType>('work');
  const [quadrant, setQuadrant] = useState<QuadrantType>('important-not-urgent');
  const [note, setNote] = useState('');
  const [isCountdown, setIsCountdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        const d = new Date(editingEvent.startTime);
        setDate(d.toISOString().split('T')[0]);
        setStartTime(d.toTimeString().slice(0, 5));
        const e = new Date(editingEvent.endTime);
        setEndTime(e.toTimeString().slice(0, 5));
        setCategory(editingEvent.category);
        setQuadrant(editingEvent.quadrant);
        setNote(editingEvent.note);
        setIsCountdown(editingEvent.isCountdown);
      } else {
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setEndTime('10:00');
        setCategory('work');
        setQuadrant((defaultQuadrant as QuadrantType) || 'important-not-urgent');
        setNote('');
        setIsCountdown(false);
      }
    }
  }, [dialogOpen, editingEvent, defaultQuadrant]);

  if (!dialogOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setLoading(true);
    const start = new Date(`${date}T${startTime}:00`).toISOString();
    const end = new Date(`${date}T${endTime}:00`).toISOString();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, { title, startTime: start, endTime: end, category, quadrant, note, isCountdown });
      } else {
        await addEvent({ title, startTime: start, endTime: end, category, quadrant, note, isCountdown });
      }
      closeDialog();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (confirm('确定要删除这个事项吗？')) {
      await deleteEvent(editingEvent.id);
      closeDialog();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{editingEvent ? '编辑事项' : '添加事项'}</h2>
          <button onClick={closeDialog} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="输入事项标题"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">日期 *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">开始</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">结束</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">板块</label>
            <div className="flex gap-2">
              {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex-1 py-2 rounded-md text-sm border transition-colors ${
                    category === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">四象限</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(QUADRANT_LABELS) as QuadrantType[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuadrant(q)}
                  className={`py-2 px-3 rounded-md text-xs border transition-colors text-left ${
                    quadrant === q ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                  }`}
                >
                  {QUADRANT_LABELS[q]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
              placeholder="添加备注..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="countdown"
              checked={isCountdown}
              onChange={(e) => setIsCountdown(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="countdown" className="text-sm">设为倒计时事项</label>
          </div>
          <div className="flex gap-2 pt-2">
            {editingEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-4 py-2 border border-destructive text-destructive rounded-md text-sm hover:bg-destructive/10"
              >
                <Trash2 size={16} />
                删除
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 border rounded-md text-sm hover:bg-accent"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
