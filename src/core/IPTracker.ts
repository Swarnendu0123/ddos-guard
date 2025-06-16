export class IPTracker {
  private idAddress: string;
  private hits: number[];
  bannedUntil: number | null;
  private permanentBan: boolean = false;

  constructor(idAddress: string) {
    this.idAddress = idAddress;
    this.hits = [];
    this.bannedUntil = null;
  }

  recordHit(timestamp: number) {
    this.hits.push(timestamp);
  }

  /**
   * Get the number of hits in the last `windowMs` milliseconds.
   * @param windowMs The time window in milliseconds to check for hits.
   * @returns The count of hits in the specified time window.
   */
  getHitCountInWindow(windowMs: number) {
    const currentTime = Date.now();
    this.hits = this.hits.filter((hit) => hit > currentTime - windowMs);
    return this.hits.length;
  }

  /**
   * Check if the IP is currently banned.
   * @param currentTime The current time in milliseconds since epoch.
   * @returns True if the IP is banned, false otherwise.
   */
  isBanned(currentTime: number) {
    return (
      this.permanentBan ||
      (this.bannedUntil !== null && currentTime < this.bannedUntil)
    );
  }

  getIsParmanentlyBanned(): boolean {
    return this.permanentBan;
  }

  /**
   * Ban the IP for a specified duration in milliseconds.
   * @param durationMs The duration in milliseconds for which to ban the IP.
   */
  ban(durationMs: number) {
    const currentTime = Date.now();
    this.bannedUntil = currentTime + durationMs;
  }

  /**
   * Permanently ban the IP.
   */
  banPermanently() {
    this.permanentBan = true;
    this.bannedUntil = null; // Clear any temporary ban
  }

  getIdAddress(): string {
    return this.idAddress;
  }
}
