/**
 * Express Application Setup
 */

import express, { Express } from "express";
import cors from "cors";
import "express-async-errors";
import { getAppConfig } from "./config/app.config";
import { container } from "./container";
import { createAdRoutes } from "./routes/ad.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const createApp = (): Express => {
  const app = express();
  const config = getAppConfig();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  const adController = container.getAdController();
  app.use("/api/ads", createAdRoutes(adController));

  // Error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
