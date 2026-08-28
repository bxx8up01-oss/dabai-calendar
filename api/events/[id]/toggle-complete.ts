import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors, handleOptions } from '../../lib/api-utils.js';
import { updateEvent } from '../../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const id = req.query.id as string;
  const method = req.method || 'PATCH';

  try {
    // PATCH /api/events/:id/toggle-complete - 切换完成状态
    if (method === 'PATCH') {
      const { completed } = req.body;
      const now = new Date().toISOString();
      const result = await updateEvent(id, {
        isCompleted: completed,
        completedAt: completed ? now : null,
        updatedAt: now,
      });
      if (!result) return res.status(404).json({ error: 'Event not found' });
      return res.json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
