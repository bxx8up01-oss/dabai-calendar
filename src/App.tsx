import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import CalendarPage from '@/pages/CalendarPage/CalendarPage';
import QuadrantPage from '@/pages/QuadrantPage/QuadrantPage';
import ReportPage from '@/pages/ReportPage/ReportPage';
import SettingsPage from '@/pages/SettingsPage/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CalendarPage />} />
        <Route path="quadrant" element={<QuadrantPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
