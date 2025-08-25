import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error Middleware:-", err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message+' -from ErrorHandler' || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

};