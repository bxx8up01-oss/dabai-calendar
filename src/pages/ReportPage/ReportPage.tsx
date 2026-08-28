import { useState, useMemo } from 'react';
import { useEvents } from '@/contexts/event-context';
import { QUADRANT_LABELS, CATEGORY_LABELS } from '@/data/calendar';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';

type ReportType = 'week' | 'month';

export default function ReportPage() {
  const { events } = useEvents();
  const [reportType, setReportType] = useState<ReportType>('week');
  const [offset, setOffset] = useState(0);
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const targetDate = new Date(now);
  if (reportType === 'week') {
    targetDate.setDate(targetDate.getDate() + offset * 7);
  } else {
    targetDate.setMonth(targetDate.getMonth() + offset);
  }

  const { start, end, title } = useMemo(() => {
    if (reportType === 'week') {
      const s = new Date(targetDate);
      s.setDate(s.getDate() - s.getDay());
      s.setHours(0, 0, 0, 0);
      const e = new Date(s);
      e.setDate(e.getDate() + 6);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e, title: `${s.getFullYear()}年第${Math.ceil((s.getDate() + new Date(s.getFullYear(), s.getMonth(), 1).getDay()) / 7)}周` };
    } else {
      const s = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const e = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: s, end: e, title: `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月` };
    }
  }, [reportType, targetDate]);

  const periodEvents = events.filter((e) => {
    const d = new Date(e.startTime);
    return d >= start && d <= end;
  });

  const completed = periodEvents.filter((e) => e.isCompleted);
  const uncompleted = periodEvents.filter((e) => !e.isCompleted);
  const completionRate = periodEvents.length > 0 ? Math.round((completed.length / periodEvents.length) * 100) : 0;

  const categoryStats = { work: periodEvents.filter((e) => e.category === 'work').length, life: periodEvents.filter((e) => e.category === 'life').length };
  const quadrantStats = {
    'urgent-important': periodEvents.filter((e) => e.quadrant === 'urgent-important').length,
    'important-not-urgent': periodEvents.filter((e) => e.quadrant === 'important-not-urgent').length,
    'urgent-not-important': periodEvents.filter((e) => e.quadrant === 'urgent-not-important').length,
    'not-urgent-not-important': periodEvents.filter((e) => e.quadrant === 'not-urgent-not-important').length,
  };

  const reportText = useMemo(() => {
    const lines = [
      `【大白日程 - ${title}报告】`,
      '',
      `📊 概览`,
      `总事项数：${periodEvents.length}`,
      `已完成：${completed.length}`,
      `未完成：${uncompleted.length}`,
      `完成率：${completionRate}%`,
      '',
      `📂 板块分布`,
      `工作：${categoryStats.work} 项`,
      `生活：${categoryStats.life} 项`,
      '',
      `🎯 四象限分布`,
      ...Object.entries(quadrantStats).map(([k, v]) => `${QUADRANT_LABELS[k as keyof typeof QUADRANT_LABELS]}：${v} 项`),
      '',
      `✅ 已完成事项`,
      ...(completed.length > 0 ? completed.map((e, i) => `${i + 1}. ${e.title}（${CATEGORY_LABELS[e.category]}）`) : ['无']),
      '',
      `⏳ 未完成事项`,
      ...(uncompleted.length > 0 ? uncompleted.map((e, i) => `${i + 1}. ${e.title}（${CATEGORY_LABELS[e.category]}）`) : ['无']),
    ];
    return lines.join('\n');
  }, [title, periodEvents, completed, uncompleted, completionRate, categoryStats, quadrantStats]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(offset - 1)} className="p-2 hover:bg-accent rounded-md"><ChevronLeft size={18} /></button>
          <h1 className="text-xl font-semibold">{title}报告</h1>
          <button onClick={() => setOffset(offset + 1)} className="p-2 hover:bg-accent rounded-md"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <button onClick={() => { setReportType('week'); setOffset(0); }} className={`px-3 py-1.5 text-sm ${reportType === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>周报</button>
            <button onClick={() => { setReportType('month'); setOffset(0); }} className={`px-3 py-1.5 text-sm ${reportType === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>月报</button>
          </div>
          <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-accent">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">总事项</div>
          <div className="text-2xl font-bold mt-1">{periodEvents.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">已完成</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{completed.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">未完成</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{uncompleted.length}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">完成率</div>
          <div className="text-2xl font-bold mt-1 text-primary">{completionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-3">板块分布</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">工作</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${periodEvents.length > 0 ? (categoryStats.work / periodEvents.length) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium w-8">{categoryStats.work}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">生活</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${periodEvents.length > 0 ? (categoryStats.life / periodEvents.length) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium w-8">{categoryStats.life}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-3">四象限分布</h3>
          <div className="space-y-2">
            {Object.entries(quadrantStats).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm">{QUADRANT_LABELS[k as keyof typeof QUADRANT_LABELS]}</span>
                <span className="text-sm font-medium">{v} 项</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-3">报告文本</h3>
        <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg font-mono">{reportText}</pre>
      </div>
    </div>
  );
}
