# DDoS Guard 
ddos-guard is a Node.js/TypeScript library that provides simple DDoS protection for Express applications. It tracks requests per IP address and enforces rate limits within a sliding time window. If an IP exceeds the allowed requests, ddos-guard can temporarily ban that IP and even permanently ban repeat offenders based on configurable thresholds. The core component is the `DDoSDetector` class (see [src/core/DDoSDetector.ts](https://github.com/Swarnendu0123/ddos-guard/blob/main/src/core/DDoSDetector.ts) in source) which maintains a map of IP trackers and applies a RateLimiter policy. You integrate it as an Express middleware, where it inspects each incoming request and blocks excess traffic, returning HTTP 429 when limits are exceeded


# Features
- IP-based rate limiting: Counts requests per IP in a configurable time window (`windowMs`).
- Temporary bans: Automatically bans an IP for `banDurationMs` once it exceeds `maxHitsAllowed` within the window.
- Permanent bans: If an IP repeatedly exceeds limits (meeting `parmanentBanThreshold`), it can be permanently banned.
- Express middleware: Integrates easily via `expressGuardMiddleware`(detector) in any Express app (see example below).
- Logging of IP status: Provides methods to log current hit counts and ban status for each tracked IP to the console (useful for monitoring).
- Configurable: All thresholds (time window, max hits, ban duration, etc.) are adjustable through a simple Config object.


# Installation
You can install the library using npm:

```bash
npm install ddos-guard
```

# Example Usage

```ts
import express from "express";
import { DDoSDetector } from "./core/DDoSDetector";
import { expressGuardMiddleware } from "./middleware/expressGuard";

const app = express();
const port = 3000;
const detector = new DDoSDetector({
  windowMs: 60 * 1000, // 1 minute time window [Time frame for request counting]
  maxHitsAllowed: 10, // 10 requests per minute [Threshold for temporary ban]
  banDurationMs: 10 * 1000, // 10 seconds ban duration [Duration of temporary ban]
  parmanentBanThreshold: 20, // 50 requests for permanent ban [Threshold for permanent ban]
});

app.use(expressGuardMiddleware(detector));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

```