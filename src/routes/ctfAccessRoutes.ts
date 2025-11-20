import express from "express";
import pool from "../config/database";

const ctfAccessRoutes = express.Router();

// Check access code untuk CTF
ctfAccessRoutes.post("/check-access", async (req, res) => {
  try {
    const { accessCode, challengeId } = req.body;

    if (!accessCode || !challengeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access code dan challenge ID diperlukan'
      });
    }

    console.log(`Checking access: code=${accessCode}, challenge=${challengeId}`);

    // Query 1: Cek berdasarkan access_code di database
    const dbResult = await pool.query(
      `SELECT c.*, cat.category_key 
       FROM ctf_challenges c 
       JOIN ctf_categories cat ON c.category_id = cat.id 
       WHERE c.access_code = $1 OR c.id = $2`,
      [accessCode, challengeId]
    );

    if (dbResult.rows.length > 0) {
      const challenge = dbResult.rows[0];
      console.log(`Access granted for challenge: ${challenge.title}`);
      
      return res.json({
        status: 'success',
        valid: true,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          drive_link: challenge.drive_link,
          access_code: challenge.access_code
        }
      });
    }

    // Query 2: Fallback - cek berdasarkan format access code legacy
    const legacyResult = await pool.query(
      `SELECT c.*, cat.category_key 
       FROM ctf_challenges c 
       JOIN ctf_categories cat ON c.category_id = cat.id 
       WHERE c.id = $1`,
      [challengeId]
    );

    if (legacyResult.rows.length > 0) {
      const challenge = legacyResult.rows[0];
      const expectedAccessCode = `CR-${challengeId}`;
      
      // Simulasi check format file akses_list_ctf.txt
      if (accessCode === expectedAccessCode) {
        console.log(`Legacy access granted for challenge: ${challenge.title}`);
        
        return res.json({
          status: 'success',
          valid: true,
          challenge: {
            id: challenge.id,
            title: challenge.title,
            drive_link: challenge.drive_link,
            access_code: challenge.access_code
          }
        });
      }
    }

    console.log(`Access denied for code: ${accessCode}, challenge: ${challengeId}`);
    return res.json({
      status: 'success',
      valid: false,
      message: 'Kode akses tidak valid untuk challenge ini'
    });

  } catch (error) {
    console.error('Error checking access code:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database query failed'
    });
  }
});

// Get all access codes (untuk admin)
ctfAccessRoutes.get("/access-codes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.access_code, c.drive_link, cat.name as category_name
       FROM ctf_challenges c 
       JOIN ctf_categories cat ON c.category_id = cat.id 
       WHERE c.is_active = true
       ORDER BY c.id`
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching access codes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database query failed'
    });
  }
});

// Update access code (untuk admin)
ctfAccessRoutes.put("/access-code/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { access_code } = req.body;

    if (!access_code) {
      return res.status(400).json({
        status: 'error',
        message: 'Access code diperlukan'
      });
    }

    const result = await pool.query(
      `UPDATE ctf_challenges SET access_code = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [access_code, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge tidak ditemukan'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating access code:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database query failed'
    });
  }
});

export default ctfAccessRoutes;