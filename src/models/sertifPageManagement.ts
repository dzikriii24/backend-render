import pool from '../config/database';

export interface PageRow {
  id?: number;
  section: string;
  field_name: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export const getAllPages = async (): Promise<PageRow[]> => {
  const res = await pool.query('SELECT * FROM sertif_page_management ORDER BY id');
  return res.rows;
};

export const getPagesBySection = async (section: string): Promise<PageRow[]> => {
  const res = await pool.query('SELECT * FROM sertif_page_management WHERE section = $1 ORDER BY id', [section]);
  return res.rows;
};

export const getPageById = async (id: number): Promise<PageRow | null> => {
  const res = await pool.query('SELECT * FROM sertif_page_management WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const insertPage = async (row: PageRow): Promise<void> => {
  await pool.query(
    'INSERT INTO sertif_page_management (section, field_name, content) VALUES ($1, $2, $3)',
    [row.section, row.field_name, row.content]
  );
};

export const updatePage = async (id: number, row: Partial<PageRow>): Promise<void> => {
  await pool.query(
    'UPDATE sertif_page_management SET field_name = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [row.field_name, row.content, id]
  );
};

export const deletePage = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM sertif_page_management WHERE id = $1', [id]);
};
