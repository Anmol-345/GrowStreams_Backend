import { Router } from 'express';
import { query } from '../sails-client.mjs';

const router = Router();

// In-memory cache
let cachedStats = null;
let cacheTimestamp = null;
const CACHE_TTL = 60000; // 60 seconds

function toBigIntStr(v) {
  if (v == null) return '0';
  return typeof v === 'bigint' ? v.toString() : String(v);
}

function formatGrow(rawUnits) {
  const num = BigInt(rawUnits);
  return (Number(num) / 1_000_000_000_000).toFixed(2);
}

function isCacheValid() {
  return cachedStats && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL);
}

async function aggregateStats() {
  try {
    // Query all contracts in parallel
    const [
      totalStreams,
      activeStreams,
      totalSupply,
      totalBounties,
      totalIdentities,
    ] = await Promise.all([
      query('streamCore', 'TotalStreams').catch(() => 0),
      query('streamCore', 'ActiveStreams').catch(() => 0),
      query('growToken', 'TotalSupply').catch(() => 0),
      query('bountyAdapter', 'TotalBounties').catch(() => 0),
      query('identityRegistry', 'TotalIdentities').catch(() => 0),
    ]);

    // Get vault summary (total across all tokens)
    const vaultConfig = await query('tokenVault', 'GetConfig').catch(() => ({}));
    
    // Calculate vault totals by querying multiple tokens
    let totalDeposited = BigInt(0);
    let totalAllocated = BigInt(0);

    // Try to get vault stats - we'll estimate from active streams for now
    // In a real implementation, you'd iterate through known tokens
    const depositedBigInt = BigInt(vaultConfig.totalDeposited ?? 0);
    const allocatedBigInt = BigInt(vaultConfig.totalAllocated ?? 0);
    
    totalDeposited = depositedBigInt;
    totalAllocated = allocatedBigInt;

    // Build response
    const stats = {
      streams: {
        total: toBigIntStr(totalStreams),
        active: toBigIntStr(activeStreams),
        paused: '0', // Would need to track separately
        stopped: toBigIntStr(BigInt(totalStreams) - BigInt(activeStreams)),
      },
      vault: {
        totalDeposited: totalDeposited.toString(),
        totalAllocated: totalAllocated.toString(),
        tvlGROW: formatGrow(totalDeposited.toString()),
      },
      token: {
        totalSupply: toBigIntStr(totalSupply),
        totalSupplyGROW: formatGrow(toBigIntStr(totalSupply)),
      },
      bounties: {
        total: toBigIntStr(totalBounties),
        open: '0', // Would need to track separately
        completed: '0', // Would need to track separately
      },
      identities: {
        total: toBigIntStr(totalIdentities),
      },
      generatedAt: new Date().toISOString(),
    };

    return stats;
  } catch (err) {
    console.error('Error aggregating protocol stats:', err);
    throw err;
  }
}

router.get('/stats', async (req, res, next) => {
  try {
    // Check cache first
    if (isCacheValid()) {
      res.set('Cache-Control', 'max-age=60');
      res.set('X-Cache', 'HIT');
      return res.json(cachedStats);
    }

    // Fetch fresh stats
    const stats = await aggregateStats();

    // Update cache
    cachedStats = stats;
    cacheTimestamp = Date.now();

    // Set cache headers
    res.set('Cache-Control', 'max-age=60');
    res.set('X-Cache', 'MISS');

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Health check endpoint for the aggregation service
router.get('/health', async (req, res, next) => {
  try {
    const health = {
      status: 'ok',
      cacheStatus: isCacheValid() ? 'valid' : 'stale',
      cacheAge: cacheTimestamp ? Math.round((Date.now() - cacheTimestamp) / 1000) : null,
      cacheTTL: CACHE_TTL / 1000,
    };
    res.json(health);
  } catch (err) {
    next(err);
  }
});

export default router;
