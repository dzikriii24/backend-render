import express from "express";
import pool from "../config/database";
import { Request, Response } from "express";

const router = express.Router(); // ✅ GUNAKAN router BUKAN express.Router()

// Route untuk check access code
router.post('/check-access', async (req: Request, res: Response) => {
  try {
    const { accessCode, challengeId } = req.body;
    
    console.log("Check access request:", { accessCode, challengeId }); // ✅ DEBUG LOG

    if (!accessCode || !challengeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access code dan challenge ID required'
      });
    }

    // Query ke database
    const result = await pool.query(
      `SELECT c.*, cat.category_key 
       FROM ctf_challenges c 
       JOIN ctf_categories cat ON c.category_id = cat.id 
       WHERE c.access_code = $1 OR c.id = $2`,
      [accessCode, challengeId]
    );

    console.log("Database result:", result.rows); // ✅ DEBUG LOG

    if (result.rows.length > 0) {
      const challenge = result.rows[0];
      res.json({
        status: 'success',
        valid: true,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          drive_link: challenge.drive_link,
          access_code: challenge.access_code
        }
      });
    } else {
      res.json({
        status: 'success', 
        valid: false,
        message: 'Access code tidak valid'
      });
    }
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database query failed',
      error: error.message
    });
  }
});

export default router; // ✅ EXPORT router