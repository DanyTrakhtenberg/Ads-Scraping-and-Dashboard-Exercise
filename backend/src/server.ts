/**
 * Server Entry Point
 */

import dotenv from "dotenv";
import { createApp } from "./app";
import { getAppConfig } from "./config/app.config";
import { container } from "./container";

// Load environment variables
dotenv.config();

async function startServer() {
  try {
    // Initialize container (connect to database)
    await container.initialize();

    // Create Express app
    const app = createApp();
    const config = getAppConfig();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close(async () => {
        await container.cleanup();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
