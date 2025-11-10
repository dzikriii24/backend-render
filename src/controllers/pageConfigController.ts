import { Request, Response } from "express";
import pool from "../config/database";
import { PageConfig } from "../models/ctfRanking";

export const getPageConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT * FROM page_config ORDER BY id DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      // Return default config if none exists
      res.json({
        header_title: "CTF Ranking",
        page_title: "Competition Results",
        description: "Welcome to our CTF competition ranking page!",
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching page config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePageConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { header_title, page_title, description }: PageConfig = req.body;

    const result = await pool.query(
      `INSERT INTO page_config (header_title, page_title, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (id) DO UPDATE 
       SET header_title = EXCLUDED.header_title, 
           page_title = EXCLUDED.page_title, 
           description = EXCLUDED.description,
           updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [header_title, page_title, description]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating page config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
