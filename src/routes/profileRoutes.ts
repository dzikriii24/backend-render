import express from 'express';
import { Request, Response, Router } from "express";
import pool from "../config/database";
import { upload, imagekit } from "../config/Imagekit";

const router = express.Router();

// Get profile by ID
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT username, profile_img FROM profile WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Profile not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New endpoint to get profile photo history
router.get("/profile/:id/photo-history", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, profile_id, photo_url, change_type, created_at 
       FROM profile_photo_history 
       WHERE profile_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching photo history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new profile
router.post(
  "/profile",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { username } = req.body;

      if (!username) {
         res.status(400).json({ error: "Username is required" });
      }

      if (!req.file) {
         res.status(400).json({ error: "Image file is required" });
         return;
      }

      // Upload gambar ke ImageKit
      // Generate a unique filename with timestamp and random string
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const uniqueFileName = `profile-${timestamp}-${randomString}-${req.file.originalname}`;

      // Upload gambar ke ImageKit
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: uniqueFileName,
        folder: "/profile",
        useUniqueFileName: true,
      });

      // Begin transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Simpan data ke database
        const profileResult = await client.query(
          "INSERT INTO profile (username, profile_img) VALUES ($1, $2) RETURNING *",
          [username, uploadResponse.url]
        );
        
        // Record initial profile photo in history
        await client.query(
          "INSERT INTO profile_photo_history (profile_id, photo_url, change_type) VALUES ($1, $2, $3)",
          [profileResult.rows[0].id, uploadResponse.url, "initial"]
        );
        
        await client.query('COMMIT');
        res.status(201).json(profileResult.rows[0]);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Error creating Profile", err);
      res.status(500).json({
        error: "Failed to create Profile",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
);

// API untuk memperbarui profile
router.put(
  "/profile/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { username } = req.body;

      // Cek apakah profil dengan ID tersebut ada
      const existingProfile = await pool.query(
        "SELECT * FROM profile WHERE id = $1",
        [id]
      );

      if (existingProfile.rows.length === 0) {
         res.status(404).json({ error: "Profile not found" });
      }

      let imageUrl = existingProfile.rows[0].profile_img;
      let newUsername = username || existingProfile.rows[0].username;
      let photoChanged = false;

      // Jika ada gambar baru, upload ke ImageKit
      if (req.file) {
        try {
          const timestamp = new Date().getTime();
          const randomString = Math.random().toString(36).substring(2, 10);
          const uniqueFileName = `profile-${timestamp}-${randomString}-${req.file.originalname}`;

          const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: uniqueFileName,
            folder: "/profile",
            useUniqueFileName: true,
          });

          // Record that the photo changed
          photoChanged = true;
          imageUrl = uploadResponse.url;
        } catch (uploadError) {
           res.status(500).json({
            error: "Failed to upload new image",
            details:
              uploadError instanceof Error ? uploadError.message : "Unknown error",
          });
        }
      }

      // Begin transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Update profile
        const updateResult = await client.query(
          `UPDATE profile
           SET username = $1, profile_img = $2
           WHERE id = $3
           RETURNING *;`,
          [newUsername, imageUrl, id]
        );

        // If photo changed, record in history
        if (photoChanged) {
          await client.query(
            "INSERT INTO profile_photo_history (profile_id, photo_url, change_type) VALUES ($1, $2, $3)",
            [id, imageUrl, "update"]
          );
        }
        
        await client.query('COMMIT');
        
        res.json({
          message: "Profile updated successfully",
          profile: updateResult.rows[0],
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({
        error: "Failed to update profile",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
);

// Delete profile
// Delete profile photo history
router.delete("/profile/photo-history/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Begin transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if the history entry exists
      const historyResult = await client.query(
        "SELECT * FROM profile_photo_history WHERE id = $1",
        [id]
      );
      
      if (historyResult.rows.length === 0) {
        res.status(404).json({ error: "Profile photo history entry not found" });
        return;
      }
      
      // Delete the history entry
      const deleteResult = await client.query(
        "DELETE FROM profile_photo_history WHERE id = $1 RETURNING *",
        [id]
      );
      
      await client.query('COMMIT');
      
      res.json({
        message: "Profile photo history entry deleted successfully",
        deletedEntry: deleteResult.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error deleting profile photo history:", err);
    res.status(500).json({
      error: "Failed to delete profile photo history entry",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;