import express, { Request, Response, Router } from "express";
import pool from "../config/database";

const ctfAccessRoutes: Router = express.Router();

// ======================
// CHECK ACCESS CODE
// ======================
ctfAccessRoutes.post("/check-access", async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessCode, challengeId } = req.body;

    if (!accessCode || !challengeId) {
      res.status(400).json({
        status: "error",
        message: "Access code dan challenge ID diperlukan",
      });
      return;
    }

    console.log(`Checking access: ${accessCode} for challenge ${challengeId}`);

    // Cek di database berdasarkan access_code atau ID challenge
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
      
      res.json({
        status: "success",
        valid: true,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          drive_link: challenge.drive_link,
          access_code: challenge.access_code,
        },
      });
      return;
    }

    // Fallback: Cek format legacy dari akses_list_ctf.txt
    // Format: email_code_challengeId (kumaha@satu.com_ggg_CR-1)
    // Format: code_challengeId (qwerty_4)
    const legacyResult = await pool.query(
      `SELECT * FROM ctf_challenges WHERE id = $1`,
      [challengeId]
    );

    if (legacyResult.rows.length > 0) {
      const challenge = legacyResult.rows[0];
      
      // Cek format CR-{id} seperti CR-1, CR-2, dll
      const expectedFormat1 = `CR-${challengeId}`;
      // Cek format tanpa prefix (hanya angka)
      const expectedFormat2 = challengeId;
      
      if (accessCode === expectedFormat1 || accessCode === expectedFormat2) {
        console.log(`Legacy access granted for challenge: ${challenge.title}`);
        
        res.json({
          status: "success",
          valid: true,
          challenge: {
            id: challenge.id,
            title: challenge.title,
            drive_link: challenge.drive_link,
            access_code: challenge.access_code,
          },
        });
        return;
      }
    }

    console.log(`Access denied for code: ${accessCode}, challenge: ${challengeId}`);
    res.json({
      status: "success",
      valid: false,
      message: "Kode akses tidak valid untuk challenge ini",
    });

  } catch (err) {
    console.error("Error in check-access:", err);
    res.status(500).json({
      status: "error",
      message: "Database query failed",
    });
  }
});

// ======================
// GET ACCESS CODES
// ======================
ctfAccessRoutes.get("/access-codes", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.access_code, c.drive_link, cat.name as category_name
       FROM ctf_challenges c
       JOIN ctf_categories cat ON c.category_id = cat.id
       WHERE c.is_active = true
       ORDER BY c.id`
    );

    res.json({
      status: "success",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error in access-codes:", err);
    res.status(500).json({
      status: "error",
      message: "Database query failed",
    });
  }
});

// ======================
// UPDATE ACCESS CODE
// ======================
ctfAccessRoutes.put("/access-code/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { access_code } = req.body;

    if (!access_code) {
      res.status(400).json({
        status: "error",
        message: "Access code diperlukan",
      });
      return;
    }

    const result = await pool.query(
      `UPDATE ctf_challenges 
       SET access_code = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [access_code, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Challenge tidak ditemukan",
      });
      return;
    }

    res.json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in update access-code:", err);
    res.status(500).json({
      status: "error",
      message: "Database query failed",
    });
  }
});

// ======================
// BULK UPDATE ACCESS CODES (Optional)
// ======================
ctfAccessRoutes.post("/bulk-access-codes", async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessCodes } = req.body; // Array of {id, access_code}

    if (!Array.isArray(accessCodes)) {
      res.status(400).json({
        status: "error",
        message: "Array accessCodes diperlukan",
      });
      return;
    }

    const results = [];
    for (const item of accessCodes) {
      const result = await pool.query(
        `UPDATE ctf_challenges 
         SET access_code = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING id, title, access_code`,
        [item.access_code, item.id]
      );
      
      if (result.rows.length > 0) {
        results.push(result.rows[0]);
      }
    }

    res.json({
      status: "success",
      data: results,
      message: `Berhasil update ${results.length} access codes`,
    });
  } catch (err) {
    console.error("Error in bulk access-codes:", err);
    res.status(500).json({
      status: "error",
      message: "Database query failed",
    });
  }
});

export default ctfAccessRoutes;