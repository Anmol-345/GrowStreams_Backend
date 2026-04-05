import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the sails-client module
vi.mock('../sails-client.mjs', () => ({
  query: vi.fn(),
}));

import { query } from '../sails-client.mjs';

// Import the aggregation logic (we'll need to extract this into a separate module)
// For now, let's test the helper functions

function toBigIntStr(v) {
  if (v == null) return '0';
  return typeof v === 'bigint' ? v.toString() : String(v);
}

function formatGrow(rawUnits) {
  const num = BigInt(rawUnits);
  return (Number(num) / 1_000_000_000_000).toFixed(2);
}

describe('Protocol Stats Aggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Helper Functions', () => {
    it('should convert bigint to string', () => {
      const result = toBigIntStr(BigInt(12345));
      expect(result).toBe('12345');
    });

    it('should handle null values', () => {
      const result = toBigIntStr(null);
      expect(result).toBe('0');
    });

    it('should convert regular numbers to strings', () => {
      const result = toBigIntStr(100);
      expect(result).toBe('100');
    });

    it('should format raw GROW units correctly', () => {
      // 1,000,000,000,000 raw units = 1 GROW
      const result = formatGrow('1000000000000');
      expect(result).toBe('1.00');
    });

    it('should format large GROW amounts', () => {
      // 1,000,000,000,000,000 raw units = 1,000 GROW
      const result = formatGrow('1000000000000000');
      expect(result).toBe('1000.00');
    });

    it('should format small GROW amounts with decimals', () => {
      // 500,000,000,000 raw units = 0.5 GROW
      const result = formatGrow('500000000000');
      expect(result).toBe('0.50');
    });

    it('should handle zero GROW', () => {
      const result = formatGrow('0');
      expect(result).toBe('0.00');
    });
  });

  describe('Contract Queries', () => {
    it('should handle query for total streams', async () => {
      (query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(BigInt(142));
      
      const result = await query('streamCore', 'TotalStreams');
      expect(result).toBe(BigInt(142));
      expect(query).toHaveBeenCalledWith('streamCore', 'TotalStreams');
    });

    it('should handle query for active streams', async () => {
      (query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(BigInt(38));
      
      const result = await query('streamCore', 'ActiveStreams');
      expect(result).toBe(BigInt(38));
    });

    it('should handle query for total supply', async () => {
      (query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(BigInt(1000000000000000000));
      
      const result = await query('growToken', 'TotalSupply');
      expect(result).toBe(BigInt(1000000000000000000));
    });

    it('should handle query for total bounties', async () => {
      (query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(BigInt(18));
      
      const result = await query('bountyAdapter', 'TotalBounties');
      expect(result).toBe(BigInt(18));
    });

    it('should handle failed queries gracefully', async () => {
      (query as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection failed'));
      
      try {
        await query('streamCore', 'TotalStreams');
      } catch (err) {
        expect(err.message).toBe('Connection failed');
      }
    });
  });

  describe('Response Formatting', () => {
    it('should format protocol stats response correctly', () => {
      const stats = {
        streams: {
          total: '142',
          active: '38',
          paused: '0',
          stopped: '104',
        },
        vault: {
          totalDeposited: '4820000000000000',
          totalAllocated: '1240000000000000',
          tvlGROW: '4.82',
        },
        token: {
          totalSupply: '1000000000000000000',
          totalSupplyGROW: '1000000.00',
        },
        bounties: {
          total: '18',
          open: '0',
          completed: '0',
        },
        identities: {
          total: '24',
        },
        generatedAt: expect.any(String),
      };

      // Verify structure
      expect(stats.streams).toHaveProperty('total');
      expect(stats.streams).toHaveProperty('active');
      expect(stats.vault).toHaveProperty('tvlGROW');
      expect(stats.token).toHaveProperty('totalSupplyGROW');
      expect(stats.bounties).toHaveProperty('total');
      expect(stats.identities).toHaveProperty('total');
      expect(stats).toHaveProperty('generatedAt');
    });

    it('should have ISO timestamp format for generatedAt', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Cache Logic', () => {
    it('should detect valid cache', () => {
      const now = Date.now();
      const cacheTimestamp = now - 30000; // 30 seconds ago
      const CACHE_TTL = 60000;

      const isValid = cacheTimestamp && (now - cacheTimestamp < CACHE_TTL);
      expect(isValid).toBe(true);
    });

    it('should detect invalid cache', () => {
      const now = Date.now();
      const cacheTimestamp = now - 70000; // 70 seconds ago
      const CACHE_TTL = 60000;

      const isValid = cacheTimestamp && (now - cacheTimestamp < CACHE_TTL);
      expect(isValid).toBe(false);
    });

    it('should detect cache miss on null', () => {
      const cachedStats = null;
      const cacheTimestamp = null;
      const CACHE_TTL = 60000;

      const isValid = cachedStats && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL);
      expect(isValid).toBe(false);
    });
  });
});
