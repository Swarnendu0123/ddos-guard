import { RateLimiter } from "./RateLimiter";
import { IPTracker } from "./IPTracker";
import { Config } from "../config/Config";

export class DDoSDetector {
  ipMap: Map<string, IPTracker>;
  rateLimiter: RateLimiter;
  banDurationMs: number;
  parmanentBanThreshold?: number;

  constructor(config: Config) {
    this.ipMap = new Map<string, IPTracker>();
    this.rateLimiter = new RateLimiter(config.windowMs, config.maxHitsAllowed);
    this.banDurationMs = config.banDurationMs;
    this.parmanentBanThreshold = config.parmanentBanThreshold;
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
        }, Permanently Banned: ${tracker.getIsParmanentlyBanned()}`
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

    // record
    ipTracker.recordHit(Date.now());

    // Check for permanent ban condition
    const parmanentBlockDecision = this.rateLimiter.shouldBanPermanently(
      ipTracker,
      this.parmanentBanThreshold
    );

    if (parmanentBlockDecision) {
      ipTracker.banPermanently();
      return { blocked: true, reason: "IP is permanently banned." };
    }

    // check for temporary ban
    const blockDecision = this.rateLimiter.shouldBlock(ipTracker);

    if (blockDecision) {
      if (ipTracker.isBanned(Date.now())) {
        return { blocked: true, reason: "Warning: IP is currently banned." };
      } else {
        ipTracker.ban(this.banDurationMs);
        return {
          blocked: true,
          reason: "Warning: Rate limit exceeded. Your IP has been banned.",
        };
      }
    } else {
      return { blocked: false };
    }
  }
}
