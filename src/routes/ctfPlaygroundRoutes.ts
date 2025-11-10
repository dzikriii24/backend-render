import { Router } from "express";
import {
  getAllCategoriesWithChallenges,
  getCTFPageConfig,
  updateCTFPageConfig,
  getAllCategories,
  getAllChallenges,
  getCategoryById,
  getChallengeById,
  createCategory,
  updateCategory,
  deleteCategory,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/ctfPlaygroundController";

const routerplayground = Router();

// ✅ PUBLIC ROUTES - untuk frontend user
routerplayground.get("/categories", getAllCategoriesWithChallenges);
routerplayground.get("/page-config", getCTFPageConfig);

// ✅ ADMIN ROUTES - untuk admin panel
routerplayground.get("/admin/categories", getAllCategories);
routerplayground.get("/admin/categories/:id", getCategoryById);
routerplayground.post("/admin/categories", createCategory);
routerplayground.put("/admin/categories/:id", updateCategory);
routerplayground.delete("/admin/categories/:id", deleteCategory);

routerplayground.get("/admin/challenges", getAllChallenges);
routerplayground.get("/admin/challenges/:id", getChallengeById);
routerplayground.post("/admin/challenges", createChallenge);
routerplayground.put("/admin/challenges/:id", updateChallenge);
routerplayground.delete("/admin/challenges/:id", deleteChallenge);

// Page config update
routerplayground.put("/page-config", updateCTFPageConfig);

export default routerplayground;
