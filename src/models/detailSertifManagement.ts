import pool from '../config/database';

export interface DetailRow {
  id?: number;
  field_name: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export const getAllDetails = async (): Promise<DetailRow[]> => {
  const res = await pool.query('SELECT * FROM detail_sertif_management ORDER BY id');
  return res.rows;
};

export const getDetailByField = async (field_name: string): Promise<DetailRow | null> => {
  const res = await pool.query('SELECT * FROM detail_sertif_management WHERE field_name = $1', [field_name]);
  return res.rows[0] || null;
};

export const insertDetail = async (row: DetailRow): Promise<void> => {
  await pool.query('INSERT INTO detail_sertif_management (field_name, content) VALUES ($1, $2)', [row.field_name, row.content]);
};

export const updateDetail = async (id: number, row: Partial<DetailRow>): Promise<void> => {
  await pool.query('UPDATE detail_sertif_management SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [row.content, id]);
};

export const deleteDetail = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM detail_sertif_management WHERE id = $1', [id]);
};
