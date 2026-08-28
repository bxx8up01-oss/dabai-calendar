import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCalendarEvents } from '@/hooks/use-calendar-events';
import type { ICalendarEvent } from '@/data/calendar';

interface EventContextValue {
  events: ICalendarEvent[];
  loading: boolean;
  addEvent: (event: any) => Promise<ICalendarEvent>;
  updateEvent: (id: string, updates: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<void>;
  dialogOpen: boolean;
  editingEvent: ICalendarEvent | null;
  defaultQuadrant?: string;
  openAddDialog: (quadrant?: string) => void;
  openEditDialog: (event: ICalendarEvent) => void;
  closeDialog: () => void;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const { events, loading, addEvent, updateEvent, deleteEvent, toggleComplete } = useCalendarEvents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ICalendarEvent | null>(null);
  const [defaultQuadrant, setDefaultQuadrant] = useState<string | undefined>(undefined);

  const openAddDialog = useCallback((quadrant?: string) => {
    setEditingEvent(null);
    setDefaultQuadrant(quadrant);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((event: ICalendarEvent) => {
    setEditingEvent(event);
    setDefaultQuadrant(undefined);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingEvent(null);
    setDefaultQuadrant(undefined);
  }, []);

  return (
    <EventContext.Provider value={{
      events, loading, addEvent, updateEvent, deleteEvent, toggleComplete,
      dialogOpen, editingEvent, defaultQuadrant,
      openAddDialog, openEditDialog, closeDialog,
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used within EventProvider');
  return ctx;
}
