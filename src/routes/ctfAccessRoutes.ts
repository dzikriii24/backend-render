import express from "express";
import pool from "../config/database";

const ctfAccessRoutes = express.Router();

// Check access code untuk CTF challenges
ctfAccessRoutes.post("/check-access", async (req, res) => {
  try {
    const { accessCode, challengeId } = req.body;

    if (!accessCode || !challengeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Access code dan challenge ID required'
      });
    }

    console.log(`Checking access: code=${accessCode}, challenge=${challengeId}`);

    // Query 1: Cek di database berdasarkan access_code
    const dbResult = await pool.query(
      `SELECT c.*, cat.category_key 
       FROM ctf_challenges c 
       JOIN ctf_categories cat ON c.category_id = cat.id 
       WHERE c.access_code = $1 OR c.id = $2`,
      [accessCode, challengeId]
    );

    if (dbResult.rows.length > 0) {
      const challenge = dbResult.rows[0];
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

    // Query 2: Jika tidak ditemukan, cek berdasarkan ID saja
    const challengeResult = await pool.query(
      `SELECT c.*, cat.category_key 
       FROM ctf_challenges c 
       JOIN ctf_categories cat ON c.category_id = cat.id 
       WHERE c.id = $1`,
      [challengeId]
    );

    if (challengeResult.rows.length === 0) {
      return res.json({
        status: 'success',
        valid: false,
        message: 'Challenge tidak ditemukan'
      });
    }

    const challenge = challengeResult.rows[0];
    
    // Format yang didukung:
    // 1. kumaha@satu.com_ggg_CR-1 → ambil bagian "ggg"
    // 2. qwerty_4 → ambil bagian "qwerty"
    
    let isValid = false;
    
    // Cek format dengan underscore
    if (accessCode.includes('_')) {
      const parts = accessCode.split('_');
      
      // Format: email_code_challengeId (kumaha@satu.com_ggg_CR-1)
      if (parts.length >= 3) {
        const codePart = parts[1]; // ggg
        const challengePart = parts[2]; // CR-1
        
        if (challengePart === challenge.access_code) {
          isValid = true;
        }
      }
      
      // Format: code_challengeId (qwerty_4)
      if (parts.length === 2) {
        const codePart = parts[0]; // qwerty
        const challengePart = parts[1]; // 4
        
        if (parseInt(challengePart) === parseInt(challengeId)) {
          isValid = true;
        }
      }
    } else {
      // Format sederhana: langsung cocokkan dengan access_code
      if (accessCode === challenge.access_code) {
        isValid = true;
      }
    }

    if (isValid) {
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
    } else {
      return res.json({
        status: 'success',
        valid: false,
        message: 'Kode akses tidak valid untuk challenge ini'
      });
    }

  } catch (error) {
    console.error('Check access error:', error);
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
      `SELECT c.id, c.title, c.access_code, cat.name as category_name
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
        message: 'Access code required'
      });
    }

    const result = await pool.query(
      `UPDATE ctf_challenges 
       SET access_code = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, title, access_code`,
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