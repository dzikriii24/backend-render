import express from "express";
import pool from "../config/database";

const RankConfig = express.Router();

// Get page config
RankConfig.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM page_config ORDER BY id DESC LIMIT 1"
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update page config
RankConfig.put("/", async (req, res) => {
  try {
    const { header_title, page_title, description } = req.body;

    const result = await pool.query(
      `UPDATE page_config SET 
       header_title = $1, page_title = $2, description = $3, 
       updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [header_title, page_title, description]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default RankConfig;
