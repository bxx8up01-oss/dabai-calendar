// 数据库层：支持 PostgreSQL（生产/Vercel）和 SQLite（本地开发）
import pg from 'pg';
import Database from 'better-sqlite3';

const { Pool } = pg;

let pgPool: pg.Pool | null = null;
let sqliteDb: Database.Database | null = null;

function usePostgres(): boolean {
  return !!process.env.DATABASE_URL;
}

function getPgPool(): pg.Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pgPool;
}

function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    const path = process.env.DATA_DIR || './data';
    const fs = require('fs');
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    sqliteDb = new Database(`${path}/calendar.db`);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

export async function initDb(): Promise<void> {
  if (usePostgres()) {
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
  } else {
    const db = getSqliteDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('work', 'life')),
        quadrant TEXT NOT NULL CHECK (quadrant IN (
          'urgent-important', 'important-not-urgent',
          'urgent-not-important', 'not-urgent-not-important'
        )),
        note TEXT DEFAULT '',
        source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('mock', 'user', 'api')),
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        is_countdown INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }
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
  is_completed: boolean | number;
  completed_at: string | null;
  is_countdown: boolean | number;
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
    isCompleted: typeof row.is_completed === 'number' ? Boolean(row.is_completed) : row.is_completed,
    completedAt: row.completed_at,
    isCountdown: typeof row.is_countdown === 'number' ? Boolean(row.is_countdown) : row.is_countdown,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllEvents(): Promise<any[]> {
  await initDb();
  if (usePostgres()) {
    const { rows } = await getPgPool().query('SELECT * FROM events ORDER BY start_time ASC');
    return rows.map(rowToEvent);
  } else {
    const rows = getSqliteDb().prepare('SELECT * FROM events ORDER BY start_time ASC').all() as DbEvent[];
    return rows.map(rowToEvent);
  }
}

export async function getEventsByFilters(filters: {
  date?: string; category?: string; completed?: string;
}): Promise<any[]> {
  await initDb();
  const conditions: string[] = [];
  const params: any[] = [];
  const pg = usePostgres();

  if (filters.date) {
    params.push(filters.date);
    conditions.push(pg ? `DATE(start_time) = $${params.length}` : 'DATE(start_time) = ?');
  }
  if (filters.category && filters.category !== 'all') {
    params.push(filters.category);
    conditions.push(pg ? `category = $${params.length}` : 'category = ?');
  }
  if (filters.completed && filters.completed !== 'all') {
    const val = pg
      ? (filters.completed === 'true' || filters.completed === '1')
      : (filters.completed === 'true' || filters.completed === '1' ? 1 : 0);
    params.push(val);
    conditions.push(pg ? `is_completed = $${params.length}` : 'is_completed = ?');
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM events ${where} ORDER BY start_time ASC`;

  if (pg) {
    const { rows } = await getPgPool().query(sql, params);
    return rows.map(rowToEvent);
  } else {
    const rows = getSqliteDb().prepare(sql).all(...params) as DbEvent[];
    return rows.map(rowToEvent);
  }
}

export async function getEventById(id: string): Promise<any | null> {
  await initDb();
  if (usePostgres()) {
    const { rows } = await getPgPool().query('SELECT * FROM events WHERE id = $1', [id]);
    return rows.length > 0 ? rowToEvent(rows[0] as DbEvent) : null;
  } else {
    const row = getSqliteDb().prepare('SELECT * FROM events WHERE id = ?').get(id) as DbEvent | undefined;
    return row ? rowToEvent(row) : null;
  }
}

export async function createEvent(event: {
  id: string; title: string; startTime: string; endTime: string;
  category: string; quadrant: string; note: string; source?: string;
  isCompleted?: boolean; completedAt?: string | null; isCountdown?: boolean;
  createdAt: string; updatedAt: string;
}): Promise<any> {
  await initDb();
  const pg = usePostgres();
  const source = event.source ?? 'user';
  const isCompleted = pg ? (event.isCompleted ?? false) : (event.isCompleted ? 1 : 0);
  const isCountdown = pg ? (event.isCountdown ?? false) : (event.isCountdown ? 1 : 0);

  if (pg) {
    await getPgPool().query(
      `INSERT INTO events (id, title, start_time, end_time, category, quadrant, note,
        source, is_completed, completed_at, is_countdown, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [event.id, event.title, event.startTime, event.endTime, event.category,
       event.quadrant, event.note ?? '', source, isCompleted,
       event.completedAt ?? null, isCountdown, event.createdAt, event.updatedAt]
    );
  } else {
    getSqliteDb().prepare(
      `INSERT INTO events (id, title, start_time, end_time, category, quadrant, note,
        source, is_completed, completed_at, is_countdown, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      event.id, event.title, event.startTime, event.endTime, event.category,
      event.quadrant, event.note ?? '', source, isCompleted,
      event.completedAt ?? null, isCountdown, event.createdAt, event.updatedAt
    );
  }
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

  const pg = usePostgres();
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;

  const addField = (name: string, val: any, isBool = false) => {
    fields.push(pg ? `${name} = $${idx++}` : `${name} = ?`);
    if (isBool && !pg) params.push(val ? 1 : 0);
    else params.push(val);
  };

  if (updates.title !== undefined) addField('title', updates.title);
  if (updates.startTime !== undefined) addField('start_time', updates.startTime);
  if (updates.endTime !== undefined) addField('end_time', updates.endTime);
  if (updates.category !== undefined) addField('category', updates.category);
  if (updates.quadrant !== undefined) addField('quadrant', updates.quadrant);
  if (updates.note !== undefined) addField('note', updates.note);
  if (updates.isCompleted !== undefined) addField('is_completed', updates.isCompleted, true);
  if (updates.completedAt !== undefined) addField('completed_at', updates.completedAt);
  if (updates.isCountdown !== undefined) addField('is_countdown', updates.isCountdown, true);
  if (updates.updatedAt !== undefined) addField('updated_at', updates.updatedAt);

  if (fields.length === 0) return existing;

  const whereParam = pg ? `$${idx}` : '?';
  params.push(id);

  if (pg) {
    await getPgPool().query(`UPDATE events SET ${fields.join(', ')} WHERE id = ${whereParam}`, params);
  } else {
    getSqliteDb().prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ${whereParam}`).run(...params);
  }
  return getEventById(id);
}

export async function deleteEvent(id: string): Promise<boolean> {
  await initDb();
  if (usePostgres()) {
    const result = await getPgPool().query('DELETE FROM events WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  } else {
    const result = getSqliteDb().prepare('DELETE FROM events WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
