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
    permanentBanThreshold?: number
  ): boolean {
    if (permanentBanThreshold === undefined) {
      return false; // no permanent ban threshold set
    }
    
    // check if IP is already permanently banned
    if (ipTracker.getIsPermanentlyBanned()) {
      return false; // already permanently banned, no need to ban again
    }

    const hitCount = ipTracker.getHitCountInWindow(this.windowMs);
    const banCount = ipTracker.getBanCount();
    
    // Permanent ban if current hits exceed threshold OR if IP has been banned multiple times
    return hitCount >= permanentBanThreshold || banCount >= 3; // Ban permanently after 3 temporary bans
  }

  getWindowMs(): number {
    return this.windowMs;
  }
  
  getMaxHits(): number {
    return this.maxHits;
  }
}
