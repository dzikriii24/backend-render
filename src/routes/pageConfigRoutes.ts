import { Router } from "express";
import {
  getPageConfig,
  updatePageConfig,
} from "../controllers/pageConfigController";

const PageConfig = Router();

PageConfig.get("/", getPageConfig);
PageConfig.put("/", updatePageConfig);

export default PageConfig;
