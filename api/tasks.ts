import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  setCors,
  handleOptions,
  apiKeyAuth,
  eventToApi,
  QUADRANT_MAP,
} from './lib/api-utils.js';
import { getEventsByFilters, createEvent } from './lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const method = req.method || 'GET';

  try {
    // GET /api/tasks - 查询任务（需 API Key）
    if (method === 'GET') {
      if (!apiKeyAuth(req, res)) return;
      const date = typeof req.query.date === 'string' ? req.query.date : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const completed = typeof req.query.completed === 'string' ? req.query.completed : undefined;
      const events = await getEventsByFilters({ date, category, completed });
      return res.json({ total: events.length, items: events.map(eventToApi) });
    }

    // POST /api/tasks - 创建任务（需 API Key）
    if (method === 'POST') {
      if (!apiKeyAuth(req, res)) return;

      const createTaskSchema = z.object({
        title: z.string().min(1, 'title is required'),
        date: z.string().min(1, 'date is required'),
        startTime: z.string().optional().default('09:00'),
        endTime: z.string().optional().default('10:00'),
        category: z.enum(['work', 'life']),
        quadrant: z
          .enum([
            'important_urgent', 'important_not_urgent',
            'not_important_urgent', 'not_important_not_urgent',
            'urgent-important', 'important-not-urgent',
            'urgent-not-important', 'not-urgent-not-important',
          ])
          .optional()
          .default('important_not_urgent'),
        note: z.string().optional().default(''),
        isCountdown: z.boolean().optional().default(false),
        isCompleted: z.boolean().optional().default(false),
      });

      const result = createTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const data = result.data;
      const startTime = new Date(`${data.date}T${data.startTime}:00`);
      const endTime = new Date(`${data.date}T${data.endTime}:00`);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ error: 'Invalid date or time format' });
      }
      if (endTime <= startTime) {
        return res.status(400).json({ error: 'endTime must be after startTime' });
      }

      const now = new Date().toISOString();
      const quadrant = QUADRANT_MAP[data.quadrant] ?? 'important-not-urgent';

      const newEvent = await createEvent({
        id: `api-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: data.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category: data.category,
        quadrant,
        note: data.note ?? '',
        source: 'api',
        isCompleted: data.isCompleted ?? false,
        completedAt: data.isCompleted ? now : null,
        isCountdown: data.isCountdown ?? false,
        createdAt: now,
        updatedAt: now,
      });

      return res.status(201).json(eventToApi(newEvent));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
