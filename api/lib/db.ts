// 数据库层：PostgreSQL（生产/Vercel）
import pg from 'pg';

const { Pool } = pg;

let pgPool: pg.Pool | null = null;

function getPgPool(): pg.Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pgPool;
}

export async function initDb(): Promise<void> {
  const pool = getPgPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('work', 'life')),
      quadrant TEXT NOT NULL CHECK (quadrant IN (
        'urgent-important', 'important-not-urgent',
        'urgent-not-important', 'not-urgent-not-important'
      )),
      note TEXT DEFAULT '',
      source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('mock', 'user', 'api')),
      is_completed BOOLEAN NOT NULL DEFAULT false,
      completed_at TIMESTAMPTZ,
      is_countdown BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

interface DbEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  category: string;
  quadrant: string;
  note: string;
  source: string;
  is_completed: boolean;
  completed_at: string | null;
  is_countdown: boolean;
  created_at: string;
  updated_at: string;
}

function rowToEvent(row: DbEvent): any {
  return {
    id: row.id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    category: row.category,
    quadrant: row.quadrant,
    note: row.note,
    source: row.source === 'api' ? 'user' : row.source,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    isCountdown: row.is_countdown,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllEvents(): Promise<any[]> {
  await initDb();
  const { rows } = await getPgPool().query('SELECT * FROM events ORDER BY start_time ASC');
  return rows.map(rowToEvent);
}

export async function getEventsByFilters(filters: {
  date?: string; category?: string; completed?: string;
}): Promise<any[]> {
  await initDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`DATE(start_time) = $${params.length}`);
  }
  if (filters.category && filters.category !== 'all') {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }
  if (filters.completed && filters.completed !== 'all') {
    const val = filters.completed === 'true' || filters.completed === '1';
    params.push(val);
    conditions.push(`is_completed = $${params.length}`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM events ${where} ORDER BY start_time ASC`;
  const { rows } = await getPgPool().query(sql, params);
  return rows.map(rowToEvent);
}

export async function getEventById(id: string): Promise<any | null> {
  await initDb();
  const { rows } = await getPgPool().query('SELECT * FROM events WHERE id = $1', [id]);
  return rows.length > 0 ? rowToEvent(rows[0] as DbEvent) : null;
}

export async function createEvent(event: {
  id: string; title: string; startTime: string; endTime: string;
  category: string; quadrant: string; note: string; source?: string;
  isCompleted?: boolean; completedAt?: string | null; isCountdown?: boolean;
  createdAt: string; updatedAt: string;
}): Promise<any> {
  await initDb();
  const source = event.source ?? 'user';
  await getPgPool().query(
    `INSERT INTO events (id, title, start_time, end_time, category, quadrant, note,
      source, is_completed, completed_at, is_countdown, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [event.id, event.title, event.startTime, event.endTime, event.category,
     event.quadrant, event.note ?? '', source, event.isCompleted ?? false,
     event.completedAt ?? null, event.isCountdown ?? false, event.createdAt, event.updatedAt]
  );
  return getEventById(event.id);
}

export async function updateEvent(
  id: string,
  updates: Partial<{
    title: string; startTime: string; endTime: string; category: string;
    quadrant: string; note: string; isCompleted: boolean;
    completedAt: string | null; isCountdown: boolean; updatedAt: string;
  }>
): Promise<any | null> {
  await initDb();
  const existing = await getEventById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (updates.title !== undefined) { fields.push(`title = $${idx++}`); params.push(updates.title); }
  if (updates.startTime !== undefined) { fields.push(`start_time = $${idx++}`); params.push(updates.startTime); }
  if (updates.endTime !== undefined) { fields.push(`end_time = $${idx++}`); params.push(updates.endTime); }
  if (updates.category !== undefined) { fields.push(`category = $${idx++}`); params.push(updates.category); }
  if (updates.quadrant !== undefined) { fields.push(`quadrant = $${idx++}`); params.push(updates.quadrant); }
  if (updates.note !== undefined) { fields.push(`note = $${idx++}`); params.push(updates.note); }
  if (updates.isCompleted !== undefined) { fields.push(`is_completed = $${idx++}`); params.push(updates.isCompleted); }
  if (updates.completedAt !== undefined) { fields.push(`completed_at = $${idx++}`); params.push(updates.completedAt); }
  if (updates.isCountdown !== undefined) { fields.push(`is_countdown = $${idx++}`); params.push(updates.isCountdown); }
  if (updates.updatedAt !== undefined) { fields.push(`updated_at = $${idx++}`); params.push(updates.updatedAt); }

  if (fields.length === 0) return existing;

  params.push(id);
  await getPgPool().query(`UPDATE events SET ${fields.join(', ')} WHERE id = $${idx}`, params);
  return getEventById(id);
}

export async function deleteEvent(id: string): Promise<boolean> {
  await initDb();
  const result = await getPgPool().query('DELETE FROM events WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}
