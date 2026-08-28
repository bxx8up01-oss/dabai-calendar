import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors, handleOptions } from '../lib/api-utils.js';
import { getEventById, updateEvent, deleteEvent } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const id = req.query.id as string;
  const method = req.method || 'GET';

  try {
    // GET /api/events/:id - 获取单个事件
    if (method === 'GET') {
      const event = await getEventById(id);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      return res.json(event);
    }

    // PUT /api/events/:id - 更新事件
    if (method === 'PUT') {
      const updates = req.body;
      updates.updatedAt = new Date().toISOString();
      const result = await updateEvent(id, updates);
      if (!result) return res.status(404).json({ error: 'Event not found' });
      return res.json(result);
    }

    // DELETE /api/events/:id - 删除事件
    if (method === 'DELETE') {
      const deleted = await deleteEvent(id);
      if (!deleted) return res.status(404).json({ error: 'Event not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
