import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors, handleOptions } from './lib/api-utils.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (handleOptions(req, res)) return;
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
