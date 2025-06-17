export class IPTracker {
  private ipAddress: string;
  private hits: number[];
  bannedUntil: number | null;
  private banCount: number = 0; // Track number of times this IP has been banned
  private permanentBan: boolean = false;

  constructor(ipAddress: string) {
    this.ipAddress = ipAddress;
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

  getIsPermanentlyBanned(): boolean {
    return this.permanentBan;
  }

  getBanCount(): number {
    return this.banCount;
  }

  /**
   * Ban the IP for a specified duration in milliseconds.
   * @param durationMs The duration in milliseconds for which to ban the IP.
   */
  ban(durationMs: number) {
    const currentTime = Date.now();
    this.bannedUntil = currentTime + durationMs;
    this.banCount++; // Increment ban count when IP is banned
  }

  /**
   * Permanently ban the IP.
   */
  banPermanently() {
    this.permanentBan = true;
    this.bannedUntil = null; // Clear any temporary ban
  }

  getIpAddress(): string {
    return this.ipAddress;
  }
}