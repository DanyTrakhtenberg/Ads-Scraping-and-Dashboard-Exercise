/**
 * Ad Routes
 */

import { Router } from "express";
import { AdController } from "../controllers/AdController";

export const createAdRoutes = (adController: AdController): Router => {
  const router = Router();

  router.get("/", adController.getAds);
  router.get("/stats", adController.getStats);
  router.get("/stats/by-date", adController.getAdsByDate);
  router.get("/stats/platforms", adController.getPlatformStats);
  router.get("/:id", adController.getAdById);

  return router;
};
