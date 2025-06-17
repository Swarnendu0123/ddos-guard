# Limiter.js

limiter.js is a Node.js/TypeScript library that provides simple Rate limiter protection for Express applications. It tracks requests per IP address and enforces rate limits within a sliding time window. If an IP exceeds the allowed requests, limiter.js can temporarily ban that IP and even permanently ban repeat offenders based on configurable thresholds. The core component is the `Detector` class (see [src/core/Detector.ts](https://github.com/Swarnendu0123/limiter.js/blob/main/src/core/Detector.ts) in source) which maintains a map of IP trackers and applies a RateLimiter policy. You integrate it as an Express middleware, where it inspects each incoming request and blocks excess traffic, returning HTTP 429 when limits are exceeded.

## Features

- **IP-based rate limiting**: Counts requests per IP in a configurable time window (`windowMs`).
- **Temporary bans**: Automatically bans an IP for `banDurationMs` once it exceeds `maxHitsAllowed` within the window.
- **Permanent bans**: If an IP repeatedly exceeds limits (meeting `permanentBanThreshold`), it can be permanently banned.
- **Express middleware**: Integrates easily via `expressGuardMiddleware`(detector) in any Express app.
- **Logging of IP status**: Provides methods to log current hit counts and ban status for each tracked IP to the console (useful for monitoring).
- **Configurable**: All thresholds (time window, max hits, ban duration, etc.) are adjustable through a simple `Config` object.

## Installation

You can install the library using npm:

```bash
npm install limiter.js@latest
```

## Framework Support

- **Express**: check out the [Express Framework Support](docs/Express.md) for integration details.


## Configuration Reference

The `Detector` is configured via an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `windowMs` | number | Yes | Time window for counting requests, in milliseconds |
| `maxHitsAllowed` | number | Yes | Maximum allowed requests per IP within one window |
| `banDurationMs` | number | Yes | Duration of a temporary ban (in ms) when the rate is exceeded |
| `permanentBanThreshold` | number | No | If provided, an IP reaching this hit count in the window will be permanently banned |

### Common Configuration Patterns

- **Lenient (Development)**: `windowMs: 60000, maxHitsAllowed: 1000, banDurationMs: 5000`
- **Moderate (Web App)**: `windowMs: 600000, maxHitsAllowed: 200, banDurationMs: 1200000`
- **Strict (API)**: `windowMs: 3600000, maxHitsAllowed: 100, banDurationMs: 1800000`
- **Very Strict (Auth)**: `windowMs: 900000, maxHitsAllowed: 5, banDurationMs: 3600000`

## API Methods

### Detector Methods

- `handleRequest(ip: string)`: Manually check if an IP should be blocked
- `logStatus()`: Log status of all tracked IPs to console
- `logIPStatus(ip: string)`: Log status of a specific IP to console

## Best Practices

1. **Environment-specific configs**: Use different limits for development, staging, and production
2. **Route-specific limits**: Apply stricter limits to sensitive endpoints (auth, admin)
3. **Monitor regularly**: Use the logging methods to monitor rate limiting effectiveness
4. **Gradual enforcement**: Start with lenient limits and tighten based on traffic patterns
5. **Consider user experience**: Don't make limits too strict for legitimate users
6. **Permanent ban carefully**: Use permanent bans sparingly and only for clear abuse patterns

## Contributing

Contributions, bug reports, and feature requests are welcome! Please fork the repository and open an issue or pull request on GitHub. Ensure your code follows the existing style and includes any relevant tests.

## License

This project is licensed under the **ISC License**.

## Contact

- [contact@swarnendu.wiki](mailto:contact@swarnendu.wiki)