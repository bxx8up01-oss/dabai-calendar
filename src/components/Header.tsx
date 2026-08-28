import { Link, useLocation } from 'react-router-dom';
import { useEvents } from '@/contexts/event-context';
import { Calendar, Grid3X3, BarChart3, Settings, Plus } from 'lucide-react';

const navItems = [
  { path: '/', label: '日历', icon: Calendar },
  { path: '/quadrant', label: '四象限', icon: Grid3X3 },
  { path: '/report', label: '报告', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
];

export function Header() {
  const location = useLocation();
  const { openAddDialog } = useEvents();

  return (
    <header className="border-b bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg text-primary">大白日程</Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={() => openAddDialog()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">添加事项</span>
        </button>
      </div>
      <nav className="md:hidden flex items-center justify-around border-t px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded text-xs ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
