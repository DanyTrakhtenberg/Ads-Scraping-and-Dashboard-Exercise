/**
 * Error handling middleware
 */

import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error("Error:", err);

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: "Route not found",
      statusCode: 404,
    },
  });
};
