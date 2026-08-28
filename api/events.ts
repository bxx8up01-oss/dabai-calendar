import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors, handleOptions } from './lib/api-utils.js';
import { getAllEvents, createEvent } from './lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const method = req.method || 'GET';

  try {
    // GET /api/events - 获取所有事件（前端内部使用）
    if (method === 'GET') {
      const events = await getAllEvents();
      return res.json({ events });
    }

    // POST /api/events - 创建事件（前端内部使用）
    if (method === 'POST') {
      const body = req.body;
      const now = new Date().toISOString();
      const newEvent = await createEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: body.title,
        startTime: body.startTime,
        endTime: body.endTime,
        category: body.category,
        quadrant: body.quadrant,
        note: body.note ?? '',
        source: body.source ?? 'user',
        isCompleted: body.isCompleted ?? false,
        completedAt: body.completedAt ?? null,
        isCountdown: body.isCountdown ?? false,
        createdAt: now,
        updatedAt: now,
      });
      return res.status(201).json(newEvent);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
