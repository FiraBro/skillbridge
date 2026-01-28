import { Router } from "express";
import * as searchController from "./search.controller.js";

const router = Router();

router.get("/", searchController.search);
router.get("/trending-skills", searchController.trendingSkills);

export default router;
