import express from "express";
import { DDoSDetector } from "./core/DDoSDetector";
import { expressGuardMiddleware } from "./middleware/expressGuard";

const app = express();
const port = 3000;
const detector = new DDoSDetector({
  windowMs: 60 * 1000, // 1 minute
  maxHitsAllowed: 10, // 10 requests per minute
  banDurationMs: 10 * 1000, // 10 seconds ban duration
  parmanentBanThreshold: 20, // 50 requests for permanent ban
});

app.use(expressGuardMiddleware(detector));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
