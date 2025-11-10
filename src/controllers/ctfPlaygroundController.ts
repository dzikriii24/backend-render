import { Request, Response } from "express";
import pool from "../config/database";
import {
  CTFCategory,
  CTFChallenge,
  CTFPageConfig,
} from "../models/ctfPlayground";

// Get all categories (for admin)
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM ctf_categories ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all challenges (for admin)
export const getAllChallenges = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(`
            SELECT chal.*, cat.name as category_name, cat.slug as category_slug
            FROM ctf_challenges chal
            LEFT JOIN ctf_categories cat ON chal.category_id = cat.id
            ORDER BY cat.id, chal.sort_order
        `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get category by ID
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM ctf_categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get challenge by ID
export const getChallengeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM ctf_challenges WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching challenge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, description, is_active = true }: CTFCategory = req.body;

    // Validation
    if (!name || !slug || !description) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const result = await pool.query(
      "INSERT INTO ctf_categories (name, slug, description, is_active) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, slug, description, is_active]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_active }: CTFCategory = req.body;

    const result = await pool.query(
      "UPDATE ctf_categories SET name = $1, slug = $2, description = $3, is_active = $4 WHERE id = $5 RETURNING *",
      [name, slug, description, is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete category
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category has challenges
    const challengesCheck = await pool.query(
      "SELECT COUNT(*) FROM ctf_challenges WHERE category_id = $1",
      [id]
    );

    if (parseInt(challengesCheck.rows[0].count) > 0) {
      res.status(400).json({
        error:
          "Cannot delete category that has challenges. Delete challenges first.",
      });
      return;
    }

    const result = await pool.query(
      "DELETE FROM ctf_categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({
      message: "Category deleted successfully",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create challenge
export const createChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      category_id,
      title,
      description,
      level,
      price,
      hint,
      drive_link,
      flag,
      sort_order,
      is_active = true,
    }: CTFChallenge = req.body;

    // Validation
    if (!category_id || !title || !level || !flag) {
      res
        .status(400)
        .json({ error: "Required fields: category_id, title, level, flag" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO ctf_challenges 
            (category_id, title, description, level, price, hint, drive_link, flag, sort_order, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        category_id,
        title,
        description,
        level,
        price,
        hint,
        drive_link,
        flag,
        sort_order,
        is_active,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update challenge
export const updateChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      category_id,
      title,
      description,
      level,
      price,
      hint,
      drive_link,
      flag,
      sort_order,
      is_active,
    }: CTFChallenge = req.body;

    const result = await pool.query(
      `UPDATE ctf_challenges SET 
            category_id = $1, title = $2, description = $3, level = $4, price = $5, 
            hint = $6, drive_link = $7, flag = $8, sort_order = $9, is_active = $10
            WHERE id = $11 RETURNING *`,
      [
        category_id,
        title,
        description,
        level,
        price,
        hint,
        drive_link,
        flag,
        sort_order,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating challenge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete challenge
export const deleteChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM ctf_challenges WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    res.json({
      message: "Challenge deleted successfully",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Existing functions...
export const getAllCategoriesWithChallenges = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(`
            SELECT 
                cat.*,
                json_agg(
                    json_build_object(
                        'id', chal.id,
                        'title', chal.title,
                        'description', chal.description,
                        'level', chal.level,
                        'price', chal.price,
                        'hint', chal.hint,
                        'drive_link', chal.drive_link,
                        'sort_order', chal.sort_order,
                        'is_active', chal.is_active
                    ) ORDER BY chal.sort_order
                ) FILTER (WHERE chal.id IS NOT NULL) as challenges
            FROM ctf_categories cat
            LEFT JOIN ctf_challenges chal ON cat.id = chal.category_id AND chal.is_active = true
            WHERE cat.is_active = true
            GROUP BY cat.id
            ORDER BY cat.id
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCTFPageConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT * FROM ctf_page_config ORDER BY id DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      res.json({
        header_title: "Playground CTF",
        page_subtitle:
          "Tempat bermain / berlatih untuk memantapkan praktikal skill di Capture The Flag",
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching page config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCTFPageConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { header_title, page_subtitle }: CTFPageConfig = req.body;

    const result = await pool.query(
      `INSERT INTO ctf_page_config (header_title, page_subtitle) 
            VALUES ($1, $2) 
            ON CONFLICT (id) DO UPDATE SET 
            header_title = EXCLUDED.header_title, 
            page_subtitle = EXCLUDED.page_subtitle,
            updated_at = CURRENT_TIMESTAMP 
            RETURNING *`,
      [header_title, page_subtitle]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating page config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
