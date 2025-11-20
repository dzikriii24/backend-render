import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes";
import aboutUsRoutes from "./routes/aboutUsRoutes";
import authRoutes from "./routes/authRoutes";
import logoutRouter from "./routes/logout";
import forgetPasswordRoute from "./routes/forgetPasswordRoute";
import konsultasiRoutes from "./routes/konsultasiroute";
import projectBimbleRoutes from "./routes/projectBimbleRoutes";
import { Request, Response, NextFunction } from "express";
import footerRoutes from "./routes/footerRoutes";
import kontakKamiRouter from "./routes/KontakKamiRoutes";
import programContentRouter from "./routes/ProgramContent";
import projectTestimoniRoutes from "./routes/ProjectTestimoniRoutes";
import KerjasamaDevRoute from "./routes/KerjasamaDevRoute";
import logsRoutes from "./routes/logsRoute";
import testimonialRoutes from "./routes/testimonialRoute";
import projectTestiClientRoute from "./routes/ProjectTestiClientRoute";
import developmentAppLogoRoute from "./routes/DevelopmentApplicationLogoRoute";
import securityMitraLogoRoute from "./routes/securityMitraLogoRoute";
import dokumentasiRoute from "./routes/dokumentasiRoute";
import keunggulanRoute from "./routes/keunggulanRoute";
import paket_1 from "./routes/paket1";
import paket_2 from "./routes/paket2";
import paket_3 from "./routes/paket3";
import profileRoutes from "./routes/profileRoutes";
import pageConfigRoutes from "./routes/pageConfigRoutes";
import sertifikatRoutes from "./routes/sertifikatRoutes";
import sertifPageManagements from "./routes/sertifPageManagementRoutes";
// Tambahkan import ini
import ctfRankingRoutes from "./routes/ctfRankingRoutes";
import ctfPlaygroundRoutes from "./routes/ctfPlaygroundRoutes";
import CTFPageManagements from "./routes/ctfPageRoutes";
import CTFAccessCode from "./routes/ctfAccessCode"

dotenv.config();

const app = express();
app.set("trust proxy", true);

// Configure CORS first
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.google.com",
      "http://192.168.100.36:3000",
      "https://ccc9-114-10-45-131.ngrok-free.app",
      "https://www.menu1s.my.id",
      "https://menu1s.my.id",
      "https://yuk-mari.com",
      "https://www.yuk-mari.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-timezone",
      "Accept",
      "Cross-Origin-Resource-Policy",
    ],
    exposedHeaders: ["Cross-Origin-Resource-Policy"],
  })
);

// Set headers for CORS
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware untuk log semua request
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
  next();
});

// ✅ ADD PING ROUTE HERE - SEBELUM ROUTES LAIN
app.get("/ping", (req: Request, res: Response) => {
  res.json({
    message: 'Hallo, Percobaan Ping',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "YMP Admin API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes - Pastikan path base sudah benar
app.use("/api/page-config", pageConfigRoutes);
app.use("/api/sertifikat", sertifikatRoutes);
app.use("/api/page-management", sertifPageManagements);


app.use("/api/rankings", ctfRankingRoutes);
app.use("/api/ctf", ctfPlaygroundRoutes);
app.use("/api/ctf-page-management", CTFPageManagements);
app.use("/api/ctf-access", CTFAccessCode);

// Tambahkan route test khusus untuk debugging
app.get("/api/ctf-page-management/test", (req: Request, res: Response) => {
  console.log("Test route accessed");
  res.json({
    message: "CTF Page Management API is working!",
    timestamp: new Date().toISOString()
  });
});

// Other API routes
app.use("/api", logsRoutes);
app.use("/api", profileRoutes);
app.use(
  "/api",
  adminRoutes,
  aboutUsRoutes,
  authRoutes,
  logoutRouter,
  forgetPasswordRoute,
  konsultasiRoutes,
  projectBimbleRoutes,
  footerRoutes,
  kontakKamiRouter,
  programContentRouter,
  projectTestimoniRoutes,
  KerjasamaDevRoute,
  testimonialRoutes,
  projectTestiClientRoute,
  developmentAppLogoRoute,
  securityMitraLogoRoute,
  dokumentasiRoute,
  keunggulanRoute,
  paket_1,
  paket_2,
  paket_3
);

// Basic route
app.get("/about-us", (req, res) => {
  res.json([{ id: 1, contentType: "text", content: "About Us content" }]);
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error details:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
});

// 404 Handler untuk route yang tidak ditemukan
// 404 Handler untuk route yang tidak ditemukan
app.use("*", (req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      "GET /ping",
      "GET /api/health",
      "GET /api/ctf-page-management",
      "GET /api/ctf-page-management/test",
      "PUT /api/ctf-page-management/:id",
      "GET /api/ctf-page-management/section/:section",
      "GET /api/rankings",
      "GET /api/ctf",
      "POST /api/ctf-access/check-access",
      "GET /about-us"
    ]
  });
});

// ✅ FIX: Convert PORT to number
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Ping: http://localhost:${PORT}/ping`);
  console.log(`📍 CTF Page Management Test: http://localhost:${PORT}/api/ctf-page-management/test`);
  console.log(`📍 CTF Page Management Main: http://localhost:${PORT}/api/ctf-page-management`);
  console.log(`📍 CTF Rankings: http://localhost:${PORT}/api/rankings`);
  console.log(`📍 CTF Playground: http://localhost:${PORT}/api/ctf`);
  console.log(`📍 CTF Access Check: http://localhost:${PORT}/api/ctf-access/check-access`);
  console.log(`📍 About Us: http://localhost:${PORT}/about-us`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;