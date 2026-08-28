import { useState, useCallback } from 'react';

export type CalendarView = 'month' | 'week' | 'day';
export type CategoryFilter = 'all' | 'work' | 'life';
export type StatusFilter = 'all' | 'active' | 'completed';

const VIEW_KEY = 'calendar_view_pref';
const FILTER_KEY = 'calendar_filter_pref';
const STATUS_KEY = 'calendar_status_pref';

function isView(v: string | null): v is CalendarView {
  return v === 'month' || v === 'week' || v === 'day';
}
function isCategory(v: string | null): v is CategoryFilter {
  return v === 'all' || v === 'work' || v === 'life';
}
function isStatus(v: string | null): v is StatusFilter {
  return v === 'all' || v === 'active' || v === 'completed';
}

export function useViewPref() {
  const [view, setViewState] = useState<CalendarView>(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    return isView(saved) ? saved : 'month';
  });
  const setView = useCallback((v: CalendarView) => {
    setViewState(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch (err) { console.error(err); }
  }, []);
  return { view, setView, synced: true };
}

export function useCategoryFilter() {
  const [filter, setFilterState] = useState<CategoryFilter>(() => {
    const saved = localStorage.getItem(FILTER_KEY);
    return isCategory(saved) ? saved : 'all';
  });
  const setFilter = useCallback((v: CategoryFilter) => {
    setFilterState(v);
    try { localStorage.setItem(FILTER_KEY, v); } catch (err) { console.error(err); }
  }, []);
  return { filter, setFilter };
}

export function useStatusFilter() {
  const [statusFilter, setStatusState] = useState<StatusFilter>(() => {
    const saved = localStorage.getItem(STATUS_KEY);
    return isStatus(saved) ? saved : 'all';
  });
  const setStatusFilter = useCallback((v: StatusFilter) => {
    setStatusState(v);
    try { localStorage.setItem(STATUS_KEY, v); } catch (err) { console.error(err); }
  }, []);
  return { statusFilter, setStatusFilter };
}
