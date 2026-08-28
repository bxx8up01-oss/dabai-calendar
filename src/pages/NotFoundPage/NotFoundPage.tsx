import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl mt-4 text-muted-foreground">页面不存在</p>
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
      >
        <Home size={18} />
        返回首页
      </Link>
    </div>
  );
}
