# Limiter.js

limiter.js is a Node.js/TypeScript library that provides simple Rate limiter protection for Express applications. It tracks requests per IP address and enforces rate limits within a sliding time window. If an IP exceeds the allowed requests, limiter.js can temporarily ban that IP and even permanently ban repeat offenders based on configurable thresholds. The core component is the `Detector` class (see [src/core/Detector.ts](https://github.com/Swarnendu0123/limiter.js/blob/main/src/core/Detector.ts) in source) which maintains a map of IP trackers and applies a RateLimiter policy. You integrate it as an Express middleware, where it inspects each incoming request and blocks excess traffic, returning HTTP 429 when limits are exceeded.

# Features

- **IP-based rate limiting**: Counts requests per IP in a configurable time window (`windowMs`).
- **Temporary bans**: Automatically bans an IP for `banDurationMs` once it exceeds `maxHitsAllowed` within the window.
- **Permanent bans**: If an IP repeatedly exceeds limits (meeting `permanentBanThreshold`), it can be permanently banned.
- **Express middleware**: Integrates easily via `expressGuardMiddleware`(detector) in any Express app (see example below).
- **Logging of IP status**: Provides methods to log current hit counts and ban status for each tracked IP to the console (useful for monitoring).
- **Configurable**: All thresholds (time window, max hits, ban duration, etc.) are adjustable through a simple `Config` object.

# Installation

You can install the library using npm:

```bash
npm install limiter.js@latest
```

# Example Usage

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";

import express from "express";
const app = express();
const port = 3000;

const detector = new Detector({
  windowMs: 60 * 1000, // 1 minute time window [Time frame for request counting]
  maxHitsAllowed: 10, // 10 requests per minute [Threshold for temporary ban]
  banDurationMs: 10 * 1000, // 10 seconds ban duration [Duration of temporary ban]
  parmanentBanThreshold: 30, // 50 requests for permanent ban [Threshold for permanent ban]
});

app.use(expressGuardMiddleware(detector));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

# Configuration

The `Detector` is configured via an object adhering to the following interface (defined in src/
config/Config.ts ) :

- `windowMs` (number): Time window for counting requests, in milliseconds.
- `maxHitsAllowed` (number): Maximum allowed requests per IP within one window.
- `banDurationMs` (number): Duration of a temporary ban (in ms) when the rate is exceeded.
- `parmanentBanThreshold` (number, optional): If provided, an IP reaching this hit count in the
  window will be permanently banned.

For example, the default example above uses a 1-minute window, 10 hits limit, 10s ban, and a permanent ban threshold of 20 . Adjust these values as needed for your traffic levels.

# Contributing

Contributions, bug reports, and feature requests are welcome! Please fork the repository and open an
issue or pull request on GitHub. Ensure your code follows the existing style and includes any relevant tests. (As a small project, it currently has no formal contribution guide; feel free to suggest improvements.)

# License

This project is licensed under the **ISC License**, as specified in package.json and LICENSE files.

# Contact

- [contact@swarnendu.wiki](mailto:contact@swarnendu.wiki)
