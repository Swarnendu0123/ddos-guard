# Express Framework Support

Limiter.js provides a middleware for the Express framework, allowing you to easily integrate rate limiting into your Express applications. This middleware can be used to protect your routes from abuse by limiting the number of requests from a single IP address within a specified time window.

## Quick Start

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";
import express from "express";

const app = express();
const port = 3000;

const detector = new Detector({
  windowMs: 60 * 1000, // 1 minute time window
  maxHitsAllowed: 10, // 10 requests per minute
  banDurationMs: 10 * 1000, // 10 seconds ban duration
  permanentBanThreshold: 30, // 30 requests for permanent ban
});

app.use(expressGuardMiddleware(detector));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

## Configuration Examples

### Basic API Rate Limiting

```ts
// Basic setup for a public API - allows 100 requests per hour
const apiDetector = new Detector({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxHitsAllowed: 100,
  banDurationMs: 30 * 60 * 1000, // 30 minutes ban
  permanentBanThreshold: 500, // Permanent ban after 500 requests in window
});

app.use('/api', expressGuardMiddleware(apiDetector));
```

### Strict Authentication Endpoint Protection

```ts
// Strict limits for sensitive endpoints like login
const authDetector = new Detector({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxHitsAllowed: 5, // Only 5 login attempts per 15 minutes
  banDurationMs: 60 * 60 * 1000, // 1 hour ban
  permanentBanThreshold: 20, // Permanent ban after 20 attempts
});

app.use('/auth/login', expressGuardMiddleware(authDetector));
app.use('/auth/register', expressGuardMiddleware(authDetector));
```

### Development Mode (Lenient)

```ts
// Lenient settings for development environment
const devDetector = new Detector({
  windowMs: 60 * 1000, // 1 minute
  maxHitsAllowed: 1000, // Very high limit for development
  banDurationMs: 5 * 1000, // Short 5-second ban
  // No permanent ban threshold for development
});

if (process.env.NODE_ENV === 'development') {
  app.use(expressGuardMiddleware(devDetector));
}
```

### Production Web App

```ts
// Balanced settings for a production web application
const webDetector = new Detector({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxHitsAllowed: 200, // 200 requests per 10 minutes
  banDurationMs: 20 * 60 * 1000, // 20 minutes ban
  permanentBanThreshold: 1000, // Permanent ban threshold
});

app.use(expressGuardMiddleware(webDetector));
```

## Advanced Usage

### Multiple Rate Limiters for Different Routes

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";
import express from "express";

const app = express();

// General API rate limiter
const generalDetector = new Detector({
  windowMs: 60 * 1000,
  maxHitsAllowed: 60,
  banDurationMs: 60 * 1000,
  permanentBanThreshold: 300,
});

// Strict rate limiter for sensitive operations
const strictDetector = new Detector({
  windowMs: 5 * 60 * 1000,
  maxHitsAllowed: 10,
  banDurationMs: 30 * 60 * 1000,
  permanentBanThreshold: 50,
});

// File upload rate limiter
const uploadDetector = new Detector({
  windowMs: 60 * 1000,
  maxHitsAllowed: 5,
  banDurationMs: 10 * 60 * 1000,
  permanentBanThreshold: 20,
});

// Apply different limiters to different routes
app.use('/api/general', expressGuardMiddleware(generalDetector));
app.use('/api/auth', expressGuardMiddleware(strictDetector));
app.use('/api/upload', expressGuardMiddleware(uploadDetector));

app.get('/api/general/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'example-token' });
});

app.post('/api/upload', (req, res) => {
  res.json({ message: 'File uploaded successfully' });
});

app.listen(3000, () => {
  console.log('Server running with multiple rate limiters');
});
```

### Monitoring and Logging

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";
import express from "express";

const app = express();

const detector = new Detector({
  windowMs: 60 * 1000,
  maxHitsAllowed: 100,
  banDurationMs: 5 * 60 * 1000,
  permanentBanThreshold: 500,
});

app.use(expressGuardMiddleware(detector));

// Monitoring endpoint (protect this in production!)
app.get('/admin/rate-limit-status', (req, res) => {
  console.log('=== Rate Limiter Status ===');
  detector.logStatus(); // Logs all tracked IPs
  res.json({ message: 'Check console for rate limiter status' });
});

// Check specific IP status
app.get('/admin/ip-status/:ip', (req, res) => {
  const ip = req.params.ip;
  console.log(`=== Status for IP: ${ip} ===`);
  detector.logIPStatus(ip);
  res.json({ message: `Check console for IP ${ip} status` });
});

// Periodic logging (every 5 minutes)
setInterval(() => {
  console.log('=== Periodic Rate Limiter Status ===');
  detector.logStatus();
}, 5 * 60 * 1000);

app.listen(3000);
```

### Custom Error Handling

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";
import express from "express";

const app = express();

const detector = new Detector({
  windowMs: 60 * 1000,
  maxHitsAllowed: 50,
  banDurationMs: 10 * 60 * 1000,
  permanentBanThreshold: 200,
});

// Custom middleware that adds additional handling
app.use((req, res, next) => {
  const result = detector.handleRequest(req.ip || req.connection.remoteAddress || 'unknown');
  
  if (result.blocked) {
    // Log the blocked request
    console.log(`Blocked request from ${req.ip}: ${result.reason}`);
    
    // Custom response based on ban type
    if (result.reason?.includes('permanently banned')) {
      return res.status(429).json({
        error: 'Permanently Banned',
        message: 'Your IP has been permanently banned due to repeated violations.',
        retryAfter: null
      });
    } else {
      return res.status(429).json({
        error: 'Rate Limited',
        message: 'Too many requests. Please try again later.',
        retryAfter: '10 minutes'
      });
    }
  }
  
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(3000);
```

### Environment-based Configuration

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";
import express from "express";

const app = express();

// Configuration based on environment
const getDetectorConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxHitsAllowed: 100,
        banDurationMs: 60 * 60 * 1000, // 1 hour
        permanentBanThreshold: 500,
      };
    
    case 'staging':
      return {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxHitsAllowed: 200,
        banDurationMs: 30 * 60 * 1000, // 30 minutes
        permanentBanThreshold: 1000,
      };
    
    case 'development':
    default:
      return {
        windowMs: 60 * 1000, // 1 minute
        maxHitsAllowed: 1000,
        banDurationMs: 10 * 1000, // 10 seconds
        permanentBanThreshold: 5000,
      };
  }
};

const detector = new Detector(getDetectorConfig());

app.use(expressGuardMiddleware(detector));

app.get('/', (req, res) => {
  res.json({ 
    message: `Hello from ${process.env.NODE_ENV} environment!`,
    rateLimitConfig: getDetectorConfig()
  });
});

app.listen(3000, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode`);
});
```

### Integration with Express Router

```ts
import { expressGuardMiddleware, Detector } from "limiter.js";
import express from "express";

const app = express();
const router = express.Router();

// Create different detectors for different route groups
const publicApiDetector = new Detector({
  windowMs: 60 * 1000,
  maxHitsAllowed: 100,
  banDurationMs: 5 * 60 * 1000,
  permanentBanThreshold: 500,
});

const adminApiDetector = new Detector({
  windowMs: 60 * 1000,
  maxHitsAllowed: 20,
  banDurationMs: 30 * 60 * 1000,
  permanentBanThreshold: 100,
});

// Public API routes with generous limits
router.use('/public', expressGuardMiddleware(publicApiDetector));
router.get('/public/status', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

router.get('/public/info', (req, res) => {
  res.json({ info: 'This is a public endpoint' });
});

// Admin routes with strict limits
router.use('/admin', expressGuardMiddleware(adminApiDetector));
router.get('/admin/users', (req, res) => {
  res.json({ users: ['admin', 'user1', 'user2'] });
});

router.post('/admin/settings', (req, res) => {
  res.json({ message: 'Settings updated' });
});

app.use('/api', router);

app.listen(3000, () => {
  console.log('Server running with route-specific rate limiting');
});
```