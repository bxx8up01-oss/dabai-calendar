import { Outlet } from 'react-router-dom';
import { EventProvider } from '@/contexts/event-context';
import { Header } from './Header';
import { EventDialog } from './EventDialog';

export function Layout() {
  return (
    <EventProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        <EventDialog />
      </div>
    </EventProvider>
  );
}
