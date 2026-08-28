// Vercel Serverless Function - 统一 API 入口
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  getAllEvents,
  getEventsByFilters,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from './lib/db.js';

const API_KEY = process.env.API_KEY || 'cal-api-key-demo-2025';

const QUADRANT_MAP: Record<string, string> = {
  important_urgent: 'urgent-important',
  important_not_urgent: 'important-not-urgent',
  not_important_urgent: 'urgent-not-important',
  not_important_not_urgent: 'not-urgent-not-important',
  'urgent-important': 'urgent-important',
  'important-not-urgent': 'important-not-urgent',
  'urgent-not-important': 'urgent-not-important',
  'not-urgent-not-important': 'not-urgent-not-important',
};

const REVERSE_QUADRANT_MAP: Record<string, string> = {
  'urgent-important': 'important_urgent',
  'important-not-urgent': 'important_not_urgent',
  'urgent-not-important': 'not_important_urgent',
  'not-urgent-not-important': 'not_important_not_urgent',
};

function eventToApi(event: any) {
  return {
    id: event.id,
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    category: event.category,
    quadrant: REVERSE_QUADRANT_MAP[event.quadrant] ?? event.quadrant,
    note: event.note,
    isCompleted: event.isCompleted,
    completedAt: event.completedAt,
    isCountdown: event.isCountdown,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
}

function apiKeyAuth(req: VercelRequest, res: VercelResponse): boolean {
  const providedKey = req.headers['x-api-key'] as string;
  if (!providedKey || providedKey !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-Key' });
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pathArr = (req.query.path as string[]) || [];
  const path = '/' + pathArr.join('/');
  const method = req.method || 'GET';

  try {
    // 健康检查
    if (path === '/health' && method === 'GET') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // GET /api/events - 前端内部使用
    if (path === '/events' && method === 'GET') {
      const events = await getAllEvents();
      return res.json({ events });
    }

    // POST /api/events - 前端内部使用
    if (path === '/events' && method === 'POST') {
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

    // PUT /api/events/:id
    if (path.startsWith('/events/') && method === 'PUT') {
      const id = pathArr[1];
      const updates = req.body;
      updates.updatedAt = new Date().toISOString();
      const result = await updateEvent(id, updates);
      if (!result) return res.status(404).json({ error: 'Event not found' });
      return res.json(result);
    }

    // DELETE /api/events/:id
    if (path.startsWith('/events/') && method === 'DELETE') {
      const id = pathArr[1];
      const deleted = await deleteEvent(id);
      if (!deleted) return res.status(404).json({ error: 'Event not found' });
      return res.json({ success: true });
    }

    // PATCH /api/events/:id/toggle-complete
    if (path.startsWith('/events/') && path.endsWith('/toggle-complete') && method === 'PATCH') {
      const id = pathArr[1];
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

    // ========== 对外 API（需 API Key） ==========

    // GET /api/tasks
    if (path === '/tasks' && method === 'GET') {
      if (!apiKeyAuth(req, res)) return;
      const date = typeof req.query.date === 'string' ? req.query.date : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const completed = typeof req.query.completed === 'string' ? req.query.completed : undefined;
      const events = await getEventsByFilters({ date, category, completed });
      return res.json({ total: events.length, items: events.map(eventToApi) });
    }

    // POST /api/tasks
    if (path === '/tasks' && method === 'POST') {
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

    // 404
    return res.status(404).json({ error: 'Not found', path });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
