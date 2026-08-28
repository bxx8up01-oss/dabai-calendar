import { useState } from 'react';
import { Copy, Check, Key, Globe, BookOpen, Database } from 'lucide-react';

export default function SettingsPage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const apiKey = process.env.API_KEY || 'your-api-key-here';
  const apiBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://your-domain.vercel.app/api';

  const handleCopy = (text: string, type: 'key' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }
    else { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold">设置</h1>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-primary" />
          <h2 className="font-semibold">API 密钥</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">用于外部系统（如豆包自定义技能）调用大白日程 API 时的鉴权密钥。</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono truncate">{apiKey}</code>
          <button onClick={() => handleCopy(apiKey, 'key')} className="flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-accent text-sm">
            {copiedKey ? <Check size={14} /> : <Copy size={14} />}
            {copiedKey ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-primary" />
          <h2 className="font-semibold">接口地址</h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">创建日程（POST）</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono truncate">{apiBaseUrl}/tasks</code>
              <button onClick={() => handleCopy(`${apiBaseUrl}/tasks`, 'url')} className="flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-accent text-sm">
                {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">查询日程（GET）</div>
            <code className="block px-3 py-2 bg-muted rounded-md text-sm font-mono truncate">{apiBaseUrl}/tasks?date=2024-01-01&category=work&completed=false</code>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-primary" />
          <h2 className="font-semibold">接口文档</h2>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">请求头</h3>
            <pre className="bg-muted p-3 rounded-md font-mono text-xs">{`Content-Type: application/json
X-API-Key: 你的API密钥`}</pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">创建日程请求体</h3>
            <pre className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">{`{
  "title": "事项标题",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "category": "work",
  "quadrant": "important_urgent",
  "note": "备注内容",
  "isCountdown": false,
  "isCompleted": false
}`}</pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">字段说明</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">title</code> - 事项标题（必填）</li>
              <li><code className="bg-muted px-1 rounded">date</code> - 日期，格式 YYYY-MM-DD（必填）</li>
              <li><code className="bg-muted px-1 rounded">startTime</code> - 开始时间，格式 HH:mm</li>
              <li><code className="bg-muted px-1 rounded">endTime</code> - 结束时间，格式 HH:mm</li>
              <li><code className="bg-muted px-1 rounded">category</code> - 板块：work（工作）/ life（生活）</li>
              <li><code className="bg-muted px-1 rounded">quadrant</code> - 四象限：important_urgent / important_not_urgent / not_important_urgent / not_important_not_urgent</li>
              <li><code className="bg-muted px-1 rounded">note</code> - 备注</li>
              <li><code className="bg-muted px-1 rounded">isCountdown</code> - 是否倒计时</li>
              <li><code className="bg-muted px-1 rounded">isCompleted</code> - 是否已完成</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-primary" />
          <h2 className="font-semibold">数据存储</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          当前数据存储在 PostgreSQL 数据库（Vercel Postgres）中。如需重置数据，请联系管理员。
        </p>
      </div>
    </div>
  );
}
