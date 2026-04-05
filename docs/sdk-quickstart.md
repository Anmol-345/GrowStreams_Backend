# GrowStreams SDK — Quick Start Guide

> **Status: SDK is under development. This document describes the target API.**

## Installation

```bash
npm install @growstreams/sdk
```

## Prerequisites

- Node.js 18+
- A Vara-compatible wallet (MetaMask via Vara.eth, or Polkadot.js / SubWallet)
- Testnet USDC tokens (faucet link TBD)

## Setup

```typescript
import { GrowStreams } from '@growstreams/sdk';

const gs = new GrowStreams({
  network: 'vara-testnet',  // or 'vara-mainnet', 'vara-eth-testnet'
  wallet: walletProvider,    // MetaMask, Polkadot.js, etc.
});

await gs.connect();
console.log('Connected as:', gs.address);
```

## Create a Stream

```typescript
// Stream 100 USDC/month to a receiver
// 100 USDC / 30 days / 86400 sec = ~0.0000386 USDC/sec = 38,580 micro-USDC/sec
const stream = await gs.createStream({
  receiver: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  token: 'USDC',
  flowRate: '38580',     // micro-USDC per second
  deposit: '5000000',    // 5 USDC initial deposit (~130 days of buffer)
});

console.log('Stream created:', stream.id);
console.log('Flow rate:', stream.flowRate, 'per second');
console.log('Buffer duration:', stream.bufferDuration, 'seconds');
```

## Monitor a Stream

```typescript
const info = await gs.getStream(streamId);

console.log('Status:', info.status);           // 'active' | 'paused' | 'stopped'
console.log('Total streamed:', info.streamed);
console.log('Withdrawable:', info.withdrawable);
console.log('Buffer remaining:', info.buffer);
console.log('Time until empty:', info.timeToEmpty, 'seconds');
```

## Withdraw (as Receiver)

```typescript
const balance = await gs.getWithdrawableBalance(streamId);
console.log('Available to withdraw:', balance);

const tx = await gs.withdraw(streamId);
console.log('Withdrawn:', tx.amount);
```

## Update Flow Rate

```typescript
// Double the flow rate
await gs.updateStream(streamId, {
  flowRate: '77160', // 2x
});
```

## Add Deposit (Extend Buffer)

```typescript
await gs.deposit(streamId, '10000000'); // add 10 USDC
```

## Stop a Stream

```typescript
const result = await gs.stopStream(streamId);
console.log('Refunded to sender:', result.refund);
```

## List Your Streams

```typescript
// As sender
const sent = await gs.getSenderStreams();
console.log('Outgoing streams:', sent.length);

// As receiver
const received = await gs.getReceiverStreams();
console.log('Incoming streams:', received.length);
```

## Real-Time Balance (Frontend)

```typescript
import { useStreamBalance } from '@growstreams/sdk/react';

function StreamBalance({ streamId }) {
  const { balance, flowRate, status } = useStreamBalance(streamId);

  return (
    <div>
      <p>Balance: {balance} USDC</p>
      <p>Rate: {flowRate}/sec</p>
      <p>Status: {status}</p>
    </div>
  );
}
```

## Flow Rate Calculator

```typescript
import { calculateFlowRate } from '@growstreams/sdk';

// Convert human-readable amounts to flow rates
const rate = calculateFlowRate({
  amount: 100,       // 100 USDC
  period: 'month',   // per month
  decimals: 6,       // USDC has 6 decimals
});

console.log(rate); // '38580' (micro-USDC per second)
```

## Error Handling

```typescript
try {
  await gs.createStream({ ... });
} catch (error) {
  if (error.code === 'INSUFFICIENT_BUFFER') {
    console.log('Need more deposit. Minimum:', error.minDeposit);
  } else if (error.code === 'STREAM_NOT_FOUND') {
    console.log('Stream does not exist');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Protocol Health & Stats

Access aggregated protocol-wide statistics for dashboards, trust indicators, and reporting.

```typescript
// Get aggregated protocol stats (60s cached)
const stats = await gs.protocol.stats();

console.log('Total streams ever created:', stats.streams.total);
console.log('Currently active streams:', stats.streams.active);
console.log('Paused streams:', stats.streams.paused);
console.log('Stopped streams:', stats.streams.stopped);

console.log('Total locked (TVL):', stats.vault.tvlGROW, 'GROW');
console.log('Total allocated to streams:', stats.vault.totalAllocated);
console.log('Total deposited in vault:', stats.vault.totalDeposited);

console.log('Total GROW minted:', stats.token.totalSupplyGROW, 'GROW');

console.log('Total bounties:', stats.bounties.total);
console.log('Open bounties:', stats.bounties.open);
console.log('Completed bounties:', stats.bounties.completed);

console.log('Unique identities registered:', stats.identities.total);

console.log('Data generated at:', stats.generatedAt);
```

### Response Types

```typescript
export interface ProtocolStats {
  streams: {
    total: string;      // Total streams ever created
    active: string;     // Currently active streams
    paused: string;     // Paused streams
    stopped: string;    // Stopped/terminated streams
  };
  vault: {
    totalDeposited: string;    // Raw units across all tokens in vault
    totalAllocated: string;    // Raw units allocated to active streams
    tvlGROW: string;          // Human-readable GROW equivalent (formatted)
  };
  token: {
    totalSupply: string;       // Total GROW minted (raw units)
    totalSupplyGROW: string;   // Human-readable format
  };
  bounties: {
    total: string;
    open: string;
    completed: string;
  };
  identities: {
    total: string;
  };
  generatedAt: string;  // ISO 8601 timestamp
}
```

### Use Cases

- **Trust Indicators**: Display "1000+ GROW already streamed" on landing page
- **Grant Reports**: "Current TVL: 50,000 GROW" for milestone documentation
- **Protocol Dashboards**: Real-time health metrics and trends
- **Monitoring**: `protocol.statsHealth()` returns cache status for alerting

### Cache Behavior

- Results cached for 60 seconds on server to minimize Vara node load
- Client SDK automatically handles `X-Cache: HIT/MISS` headers
- Use `.statsHealth()` to check current cache age if lower latency needed

```typescript
// Check cache status
const health = await gs.protocol.statsHealth();
console.log('Cache age:', health.cacheAge, 'ms');
console.log('Cache status:', health.cacheStatus); // 'HIT' or 'MISS'

if (health.cacheAge > 50000) {
  // Cache about to expire, consider refreshing UI
}
```

## Supported Tokens

| Token | Program ID | Decimals | Network |
|---|---|---|---|
| USDC | `TBD` | 6 | Vara Testnet |
| VARA | `TBD` | 12 | Vara Testnet |

## Next Steps

- [Protocol Spec](./protocol.md) — understand how streams work under the hood
- [Contract API](./contracts-api.md) — direct contract interaction reference
- [Security Model](./security.md) — buffer/solvency model explained
