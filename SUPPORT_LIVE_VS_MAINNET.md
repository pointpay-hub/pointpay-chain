# Support note — what is live vs not mainnet (Jul 2026)

Use this for user/support replies. Keep it short and honest.

## PNP coin — complete on PointPay

| Thing | URL / where | What it is |
|-------|-------------|------------|
| Exchange | https://pointpay.exchange | Spot / venue accounts |
| **PNP Hub (coin)** | https://pointpay.exchange/pnp | Buy, sell, stake, missions, fee-in-PNP — **max 1 crore worldwide** |
| Crash PNP | https://play.pointpay.exchange | **PointPay Play** — SSO from Hub; PNP bets via venue ledger (90/4/3/3). HD crash deposits frozen (`CRASH_HD_DEPOSITS=0`) — fund on Hub only. |
| **Withdraw to BSC** | Hub (when enabled) | Same PNP coin in MetaMask / Trust on BNB Smart Chain |
| Supply API | `/api/public/pnp/supply` | Global cap breakdown |
| Explorer (optional) | testnet-explorer | Dev/testnet chain view |

**PNP = one coin, one global cap (1 crore).** Hub + BSC + future native chain share the same supply — never 1 crore per network.

## Parked (later — users + funds)

- External validators / mainnet ceremony  
- Native `pnp1…` withdraw (PointPay Chain mainnet)  
- Extra EVM chains (ETH, Polygon) — same cap rules  

## One-line answers

- “Is PNP live?” → **Yes** — PNP coin on Hub; 1 crore max total.  
- “MetaMask?” → **Yes on BSC** when withdraw enabled (add PNP token on BSC network).  
- “Is it mainnet chain?” → Native chain is testnet soak; **coin product is live on Hub**.  
- “1 crore har network pe?” → **Nahi** — poore world mein sirf 1 crore combined.

## Env freeze (chain label)

- `PNP_CHAIN_STATUS=dedicated_dev`  
- `PNP_CHAIN_ID=pointpay-dedicated-1`  

Enable BSC wallets separately:

```env
PNP_EVM_WITHDRAW_ENABLED=true
PNP_BEP20_CONTRACT=0x...
```

See [PNP_COIN.md](./PNP_COIN.md) · [PNP_WALLETS.md](./PNP_WALLETS.md)
