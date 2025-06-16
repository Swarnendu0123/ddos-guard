import { IPTracker } from "./IPTracker";

export class RateLimiter {
  private windowMs: number;
  private maxHits: number;

  constructor(windowMs: number, maxHits: number) {
    this.windowMs = windowMs;
    this.maxHits = maxHits;
  }

  shouldBlock(ipTracker: IPTracker): boolean {
    const hitCount = ipTracker.getHitCountInWindow(this.windowMs);
    return hitCount >= this.maxHits;
  }

  shouldBanPermanently(
    ipTracker: IPTracker,
    parmanentBanThreshold?: number
  ): boolean {
    if (parmanentBanThreshold === undefined) {
      return false; // no permanent ban threshold set
    }
    const hitCount = ipTracker.getHitCountInWindow(this.windowMs);
    return hitCount >= parmanentBanThreshold;
  }

  getWindowMs(): number {
    return this.windowMs;
  }
  getMaxHits(): number {
    return this.maxHits;
  }
}
