import { NextResponse } from 'next/server';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitStore {
  [key: string]: {
    timestamps: number[];
    limit: number;
    windowMs: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly defaultLimit: number;
  private readonly defaultWindowMs: number;

  constructor(defaultLimit: number = 5, defaultWindowMs: number = 60000) {
    this.defaultLimit = defaultLimit;
    this.defaultWindowMs = defaultWindowMs;
  }

  private cleanup(key: string): void {
    const now = Date.now();
    const data = this.store[key];
    if (!data) return;

    // Remove timestamps outside the window
    data.timestamps = data.timestamps.filter(
      timestamp => now - timestamp < data.windowMs
    );

    // If no timestamps left, remove the key
    if (data.timestamps.length === 0) {
      delete this.store[key];
    }
  }

  public limit(key: string, customLimit?: number, customWindowMs?: number): RateLimitInfo {
    const limit = customLimit ?? this.defaultLimit;
    const windowMs = customWindowMs ?? this.defaultWindowMs;
    const now = Date.now();

    // Initialize the store for this key if it doesn't exist
    if (!this.store[key]) {
      this.store[key] = {
        timestamps: [],
        limit,
        windowMs,
      };
    } else {
      // Update the limit and windowMs for existing entries
      this.store[key].limit = limit;
      this.store[key].windowMs = windowMs;
      
      // Cleanup old timestamps
      this.cleanup(key);
      
      // Re-initialize if cleanup removed the key
      if (!this.store[key]) {
        this.store[key] = {
          timestamps: [],
          limit,
          windowMs,
        };
      }
    }

    const data = this.store[key];
    const timestamps = data.timestamps;

    // Check if we're under the limit
    const isUnderLimit = timestamps.length < limit;

    if (isUnderLimit) {
      timestamps.push(now);
    }

    // Calculate reset time (oldest timestamp + window)
    const reset = timestamps.length > 0
      ? timestamps[0] + windowMs
      : now + windowMs;

    return {
      limit,
      remaining: Math.max(0, limit - timestamps.length),
      reset,
    };
  }

  public getRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
    return {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': info.reset.toString(),
    };
  }

  public createRateLimitResponse(info: RateLimitInfo): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: info.reset
        }
      },
      {
        status: 429,
        headers: {
          ...this.getRateLimitHeaders(info),
          'Retry-After': Math.ceil((info.reset - Date.now()) / 1000).toString()
        }
      }
    );
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;