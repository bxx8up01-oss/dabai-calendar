import type { VercelRequest, VercelResponse } from '@vercel/node';

export const API_KEY = process.env.API_KEY || 'cal-api-key-demo-2025';

export const QUADRANT_MAP: Record<string, string> = {
  important_urgent: 'urgent-important',
  important_not_urgent: 'important-not-urgent',
  not_important_urgent: 'urgent-not-important',
  not_important_not_urgent: 'not-urgent-not-important',
  'urgent-important': 'urgent-important',
  'important-not-urgent': 'important-not-urgent',
  'urgent-not-important': 'urgent-not-important',
  'not-urgent-not-important': 'not-urgent-not-important',
};

export const REVERSE_QUADRANT_MAP: Record<string, string> = {
  'urgent-important': 'important_urgent',
  'important-not-urgent': 'important_not_urgent',
  'urgent-not-important': 'not_important_urgent',
  'not-urgent-not-important': 'not_important_not_urgent',
};

export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
}

export function apiKeyAuth(req: VercelRequest, res: VercelResponse): boolean {
  const providedKey = req.headers['x-api-key'] as string;
  if (!providedKey || providedKey !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-Key' });
    return false;
  }
  return true;
}

export function eventToApi(event: any) {
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

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
