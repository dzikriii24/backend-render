// controllers/ctfPageController.ts
import { Request, Response } from 'express';
import pool from '../config/database';

export const getCtfPageContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM ctf_page_management ORDER BY section, id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CTF page content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCtfPageContent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const result = await pool.query(
      'UPDATE ctf_page_management SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [content, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating CTF page content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCtfPageContentBySection = async (req: Request, res: Response): Promise<void> => {
  const { section } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM ctf_page_management WHERE section = $1 ORDER BY id',
      [section]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CTF page content by section:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};