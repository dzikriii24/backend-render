import express, { Router, Request, Response } from "express";
import { findAllAdmins } from "../models/adminModel";  // Pastikan path-nya benar
import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

// Endpoint untuk login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin) {
       res.status(401).json({ message: 'Invalid credentials' });
       return;
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
       res.status(401).json({ message: 'Invalid credentials' });
       return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Send response with token
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Endpoint untuk mengambil daftar admin
router.get("/admins", async (req: Request, res: Response): Promise<void> => {
  try {
    // Ambil semua data admin dari database
    const admins = await findAllAdmins();  // Mengambil semua admin

    if (admins.length === 0) {
      console.log("No admins found");  // Log ketika tidak ada admin ditemukan
      res.status(404).json({ error: "No admins found" });
      return;
    }

    // Menambahkan log untuk menunjukkan bahwa admins berhasil ditemukan
    console.log("Admins found:", admins);  // Log daftar admin yang ditemukan
    res.status(200).json({ admins });
  } catch (error) {
    console.error("Error:", error);  // Log error jika terjadi kesalahan
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.put("/admins/email/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newEmail } = req.body;

    if (!newEmail) {
      res.status(400).json({ error: "New email is required" });
      return;
    }

    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT * FROM admins WHERE email = $1 AND id != $2',
      [newEmail, id]
    );

    if (emailCheck.rows.length > 0) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const result = await pool.query(
      'UPDATE admins SET email = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newEmail, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    console.log("Email updated successfully");
    res.status(200).json({ 
      message: "Email updated successfully",
      admin: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ error: "Failed to update email" });
  }
});

// Update admin password
router.put("/admins/password/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: "New password is required" });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      'UPDATE admins SET password = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    console.log("Password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Update admin phone number
router.put("/admins/phone/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let { newPhone } = req.body;

    if (!newPhone) {
      res.status(400).json({ error: "New phone number is required" });
      return;
    }

    // Convert phone number starting with '08' to '+62'
    if (newPhone.startsWith("08")) {
      newPhone = "+62" + newPhone.slice(1);
    }

    // Validate phone number (basic validation)
    if (!/^\+62\d{9,13}$/.test(newPhone)) {
      res.status(400).json({ error: "Phone number must be in valid Indonesian format (+62XXXXXXXXXXX)" });
      return;
    }

    const result = await pool.query(
      'UPDATE admins SET phone_number = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newPhone, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    console.log("Phone number updated successfully");
    res.status(200).json({ 
      message: "Phone number updated successfully",
      admin: {
        id: result.rows[0].id,
        phone_number: result.rows[0].phone_number
      },
      reload: true
    });

  } catch (error) {
    console.error("Error updating phone number:", error);
    res.status(500).json({ error: "Failed to update phone number" });
  }
});


export default router;
