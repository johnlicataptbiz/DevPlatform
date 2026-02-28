import fs from 'fs';
import path from 'path';

interface CacheEntry {
  content: string;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry>;
  private cacheFilePath: string;
  private maxEntries: number; // Maximum number of cache entries

  constructor(ttl: number = 10 * 60 * 1000, maxEntries: number = 100) { // 10 minutes default TTL, max 100 entries
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.cacheFilePath = path.join(process.cwd(), '.scrape-cache.json');
    this.loadCacheFromFile();
  }

  private loadCacheFromFile() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const fileContent = fs.readFileSync(this.cacheFilePath, 'utf8');
        const cacheData = JSON.parse(fileContent);
        
        // Populate the map with cache entries
        Object.entries(cacheData).forEach(([key, value]) => {
          this.cache.set(key, value as CacheEntry);
        });
      }
    } catch (error) {
      console.warn('Could not load cache from file:', error);
    }
  }

  private saveCacheToFile() {
    try {
      const cacheObject: Record<string, CacheEntry> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(cacheObject, null, 2));
    } catch (error) {
      console.warn('Could not save cache to file:', error);
    }
  }

  // Clean up expired entries and enforce size limit
  private cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired entries
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
    
    // If we're over the max entries limit, remove oldest entries
    if (this.cache.size > this.maxEntries) {
      const entriesArray = Array.from(this.cache.entries());
      // Sort by timestamp (oldest first) and remove excess
      entriesArray.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const excessCount = this.cache.size - this.maxEntries;
      for (let i = 0; i < excessCount; i++) {
        this.cache.delete(entriesArray[i][0]);
      }
    }
    
    this.saveCacheToFile();
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cleanup();
      return null;
    }

    return entry.content;
  }

  set(key: string, value: string, ttl?: number) {
    const entry: CacheEntry = {
      content: value,
      timestamp: Date.now(),
      ttl: ttl || 10 * 60 * 1000, // Use provided TTL or default
    };

    this.cache.set(key, entry);
    
    // Perform cleanup to maintain size limits
    this.cleanup();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    
    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cleanup();
      return false;
    }

    return true;
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
    this.saveCacheToFile();
  }
  
  // Clear the entire cache
  clear() {
    this.cache.clear();
    if (fs.existsSync(this.cacheFilePath)) {
      fs.unlinkSync(this.cacheFilePath);
    }
  }
  
  // Get cache stats
  getStats() {
    let size = 0;
    let expiredCount = 0;
    const now = Date.now();
    
    for (const entry of this.cache.values()) {
      size++;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }
    
    return {
      size,
      expiredCount,
      maxSize: this.maxEntries,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export a singleton instance with default 10-minute TTL
export const scrapeCache = new SimpleCache(10 * 60 * 1000); // 10 minutes