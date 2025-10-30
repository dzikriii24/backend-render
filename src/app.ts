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
import profileRoutes from "./routes/profileRoutes"

dotenv.config();

const app = express();
app.set("trust proxy", true);

// Configure CORS first
app.use(
  cors({
    origin: ["http://localhost:3000", "https://www.google.com", "http://192.168.100.36:3000", "https://ccc9-114-10-45-131.ngrok-free.app"],
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

// Body parsing middleware
app.use(express.json());
app.use(bodyParser.json());

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error details:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
});

// Basic route
app.get("/about-us", (req, res) => {
  res.json([{ id: 1, contentType: "text", content: "About Us content" }]);
});

// Logs route - Explicitly set the path
app.use('/api', logsRoutes);
app.use('/api', profileRoutes);

// Other API routes
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
  paket_3,
  profileRoutes
);

// Final error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error received:", err);
  console.error("Request details:", req.body);
  res.status(500).send("Something went wrong!");
});

export default app;