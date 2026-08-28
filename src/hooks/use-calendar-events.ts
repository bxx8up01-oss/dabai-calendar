import { useState, useEffect, useCallback } from 'react';
import type { ICalendarEvent } from '@/data/calendar';
import { MOCK_EVENTS } from '@/data/calendar';

const STORAGE_KEY = 'calendar_events';

function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readLocalStorageEvents(): ICalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ICalendarEvent[];
    }
  } catch (err) {
    console.error('Failed to read events from storage:', err);
  }
  return [];
}

function writeLocalStorageEvents(events: ICalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to storage:', err);
  }
}

export function clearLocalStorageEvents(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function initializeEvents(): ICalendarEvent[] {
  const existing = readLocalStorageEvents();
  if (existing.length > 0) return existing;
  writeLocalStorageEvents(MOCK_EVENTS);
  return MOCK_EVENTS;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<ICalendarEvent[]>(() => initializeEvents());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events) && data.events.length > 0) {
            setEvents(data.events);
            setLoading(false);
            return;
          }
        }
      } catch { /* 后端不可用，降级到 localStorage */ }
      const data = readLocalStorageEvents();
      if (data.length === 0) {
        writeLocalStorageEvents(MOCK_EVENTS);
        setEvents(MOCK_EVENTS);
      } else {
        setEvents(data);
      }
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err.message || '加载失败');
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const addEvent = useCallback(async (event: Omit<ICalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'isCompleted' | 'completedAt'> & {
    isCompleted?: boolean; completedAt?: string | null; isCountdown?: boolean;
  }): Promise<ICalendarEvent> => {
    const now = new Date().toISOString();
    const newEvent: ICalendarEvent = {
      id: generateId(), isCompleted: false, completedAt: null, isCountdown: false,
      ...event, source: 'user', createdAt: now, updatedAt: now,
    };
    const all = readLocalStorageEvents();
    const updated = [...all, newEvent];
    writeLocalStorageEvents(updated);
    setEvents(updated);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        const serverEvent = await res.json();
        const cur = readLocalStorageEvents();
        const synced = cur.map((e) => (e.id === newEvent.id ? serverEvent : e));
        writeLocalStorageEvents(synced);
        setEvents(synced);
        return serverEvent;
      }
    } catch { /* 后端不可用，保留本地数据 */ }
    return newEvent;
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<ICalendarEvent, 'id' | 'createdAt' | 'source'>>): Promise<void> => {
    const now = new Date().toISOString();
    const all = readLocalStorageEvents();
    const updated = all.map((e) => e.id === id ? { ...e, ...updates, updatedAt: now } : e);
    writeLocalStorageEvents(updated);
    setEvents(updated);
    try {
      await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedAt: now }),
      });
    } catch { /* ignore */ }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    const all = readLocalStorageEvents();
    const updated = all.filter((e) => e.id !== id);
    writeLocalStorageEvents(updated);
    setEvents(updated);
    try { await fetch(`/api/events/${id}`, { method: 'DELETE' }); } catch { /* ignore */ }
  }, []);

  const toggleComplete = useCallback(async (id: string, completed: boolean): Promise<void> => {
    const now = new Date().toISOString();
    const all = readLocalStorageEvents();
    const updated = all.map((e) =>
      e.id === id ? { ...e, isCompleted: completed, completedAt: completed ? now : null, updatedAt: now } : e
    );
    writeLocalStorageEvents(updated);
    setEvents(updated);
    try {
      await fetch(`/api/events/${id}/toggle-complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
    } catch { /* ignore */ }
  }, []);

  return { events, loading, error, loadEvents, addEvent, updateEvent, deleteEvent, toggleComplete };
}
