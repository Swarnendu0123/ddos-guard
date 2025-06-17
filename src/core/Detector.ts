import { RateLimiter } from "./RateLimiter";
import { IPTracker } from "./IPTracker";
import { Config } from "../config/Config";

export class Detector {
  ipMap: Map<string, IPTracker>;
  rateLimiter: RateLimiter;
  banDurationMs: number;
  permanentBanThreshold?: number;

  constructor(config: Config) {
    this.ipMap = new Map<string, IPTracker>();
    this.rateLimiter = new RateLimiter(config.windowMs, config.maxHitsAllowed);
    this.banDurationMs = config.banDurationMs;
    this.permanentBanThreshold = config.permanentBanThreshold;
  }

  logStatus() {
    for (const [ip, tracker] of this.ipMap.entries()) {
      const hitCount = tracker.getHitCountInWindow(
        this.rateLimiter.getWindowMs()
      );
      const isBanned = tracker.isBanned(Date.now());
      console.log(
        `IP: ${ip}, Hits: ${hitCount}, Banned: ${isBanned}, Banned Until: ${
          tracker.bannedUntil
            ? new Date(tracker.bannedUntil).toISOString()
            : "N/A"
        }`
      );
    }
  }

  logIPStatus(ip: string) {
    const tracker = this.ipMap.get(ip);
    if (tracker) {
      const hitCount = tracker.getHitCountInWindow(
        this.rateLimiter.getWindowMs()
      );

      const isBanned = tracker.isBanned(Date.now());
      console.log(
        `IP: ${ip}, Hits: ${hitCount}, Banned: ${isBanned}, Banned Until: ${
          tracker.bannedUntil
            ? new Date(tracker.bannedUntil).toISOString()
            : "N/A"
        }, Permanently Banned: ${tracker.getIsPermanentlyBanned()}`
      );
    } else {
      console.log(`IP: ${ip} not found.`);
    }
  }

  handleRequest(ip: string): { blocked: boolean; reason?: string } {
    let ipTracker = this.ipMap.get(ip);

    if (!ipTracker) {
      ipTracker = new IPTracker(ip);
      this.ipMap.set(ip, ipTracker);
    }

    // Check if IP is permanently banned first
    if (ipTracker.getIsPermanentlyBanned()) {
      return { blocked: true, reason: "IP is permanently banned." };
    }

    // Check if IP is currently under temporary ban
    if (ipTracker.isBanned(Date.now())) {
      return { blocked: true, reason: "Warning: IP is currently banned." };
    }

    // Record the hit
    ipTracker.recordHit(Date.now());

    // Check for permanent ban condition
    const permanentBlockDecision = this.rateLimiter.shouldBanPermanently(
      ipTracker,
      this.permanentBanThreshold
    );

    if (permanentBlockDecision) {
      ipTracker.banPermanently();
      return { blocked: true, reason: "IP has been permanently banned due to excessive violations." };
    }

    // Check for temporary ban
    const blockDecision = this.rateLimiter.shouldBlock(ipTracker);

    if (blockDecision) {
      ipTracker.ban(this.banDurationMs);
      return {
        blocked: true,
        reason: "Warning: Rate limit exceeded. Your IP has been banned temporarily.",
      };
    }

    return { blocked: false };
  }
}