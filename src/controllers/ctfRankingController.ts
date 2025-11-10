import { Request, Response } from "express";
import pool from "../config/database";
import { CTFRanking } from "../models/ctfRanking";

export const getAllRankings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Fetching all rankings...");
    const result = await pool.query(
      "SELECT * FROM ctf_ranking ORDER BY total_score DESC"
    );
    console.log("Data fetched:", result.rows.length, "records");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRankingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("Fetching ranking by ID:", id);

    const result = await pool.query("SELECT * FROM ctf_ranking WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Ranking not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching ranking:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createRanking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      nama,
      challenge_terakhir,
      level_terakhir,
      score_terakhir,
      total_score,
      list_soal,
    }: CTFRanking = req.body;

    console.log("Creating new ranking:", {
      nama,
      challenge_terakhir,
      level_terakhir,
      score_terakhir,
      total_score,
      list_soal,
    });

    // Validation
    if (!nama || !challenge_terakhir || !level_terakhir || !list_soal) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO ctf_ranking (nama, challenge_terakhir, level_terakhir, score_terakhir, total_score, list_soal) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        nama,
        challenge_terakhir,
        level_terakhir,
        score_terakhir,
        total_score,
        list_soal,
      ]
    );

    console.log("Ranking created successfully:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating ranking:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateRanking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nama,
      challenge_terakhir,
      level_terakhir,
      score_terakhir,
      total_score,
      list_soal,
    }: CTFRanking = req.body;

    console.log("Updating ranking ID:", id, "with data:", {
      nama,
      challenge_terakhir,
      level_terakhir,
      score_terakhir,
      total_score,
      list_soal,
    });

    // Validation
    if (!nama || !challenge_terakhir || !level_terakhir || !list_soal) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const result = await pool.query(
      `UPDATE ctf_ranking 
       SET nama = $1, challenge_terakhir = $2, level_terakhir = $3, score_terakhir = $4, 
           total_score = $5, list_soal = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [
        nama,
        challenge_terakhir,
        level_terakhir,
        score_terakhir,
        total_score,
        list_soal,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Ranking not found" });
      return;
    }

    console.log("Ranking updated successfully:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating ranking:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteRanking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("Deleting ranking ID:", id);

    const result = await pool.query(
      "DELETE FROM ctf_ranking WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Ranking not found" });
      return;
    }

    console.log("Ranking deleted successfully:", result.rows[0]);
    res.json({
      message: "Ranking deleted successfully",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting ranking:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
