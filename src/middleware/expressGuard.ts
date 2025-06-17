import { Request, Response, NextFunction } from "express";
import { Detector } from "../core/Detector";

export const expressGuardMiddleware =
  (detector: Detector) =>
  (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";

    const result = detector.handleRequest(ip);

    detector.logIPStatus(ip);

    if (result.blocked) {
      res.status(429).send({
        error: "Too many requests",
        reason: result.reason || "Rate limit exceeded",
      });
    } else {
      next();
    }
  };
