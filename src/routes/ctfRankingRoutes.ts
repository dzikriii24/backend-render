import { Router } from "express";
import {
  getAllRankings,
  getRankingById,
  createRanking,
  updateRanking,
  deleteRanking,
} from "../controllers/ctfRankingController";

const CTFRank = Router();

CTFRank.get("/", getAllRankings);
CTFRank.get("/:id", getRankingById);
CTFRank.post("/", createRanking);
CTFRank.put("/:id", updateRanking);
CTFRank.delete("/:id", deleteRanking);

export default CTFRank;
