# PNP coin — complete product (Jul 2026)

**PNP is live** as PointPay’s native brand coin — **max 1 crore (10M) worldwide**, all networks combined.

## What users can do today

| Action | Where |
|--------|--------|
| Buy / sell PNP | Hub + PNP/USDT spot |
| Stake, missions, fee discount | PNP Hub |
| Crash with PNP | play.pointpay.exchange |
| See supply & cap | Hub economy strip + `GET /api/public/pnp` |
| Withdraw to MetaMask / Trust | Hub → **BSC** (when `PNP_EVM_WITHDRAW_ENABLED` + contract set) |

## One coin, many networks (no duplicate 1 crore)

```
Total cap = 10,000,000 PNP globally

= locked pools (sale, vaults, …)
+ Hub balances + stake
+ on BSC/EVM (withdrawn)
+ burned
+ reward pool
```

Moving Hub → BSC **does not mint a new crore** — it **relocates** existing supply.

## Rails

| Network | Wallet | Status |
|---------|--------|--------|
| PointPay Hub | Login | **Live** |
| BSC | MetaMask, Trust | Enable after [`evm/PNP.sol`](./evm/PNP.sol) deploy |
| PointPay Chain (`pnp1…`) | Keplr, Leap | After mainnet ceremony (later) |

Full guide: [PNP_WALLETS.md](./PNP_WALLETS.md)

## Ops checklist (BSC send/receive)

1. Deploy `PNP.sol` on BSC — **do not mint full 10M**; mint hot-wallet float only  
2. Set env on tradeone (see [`evm/README.md`](./evm/README.md))  
3. Fund hot wallet with PNP + BNB gas  
4. Users: Hub → Withdraw to `0x…` → add token in MetaMask (BSC)

## Support one-liner

**“PNP is PointPay’s coin — 1 crore max total. Use it on Hub today; withdraw to your BSC wallet when enabled; native chain wallet later.”**

See [SUPPORT_LIVE_VS_MAINNET.md](./SUPPORT_LIVE_VS_MAINNET.md).
