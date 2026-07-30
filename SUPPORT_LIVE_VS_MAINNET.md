# Support note — what is live vs not mainnet (Jul 2026)

Use this for user/support replies. Keep it short and honest.

## Live today (product)

| Thing | URL / where | What it is |
|-------|-------------|------------|
| Exchange | https://pointpay.exchange | Spot / venue accounts |
| PNP Hub | https://pointpay.exchange/pnp | **Custodial venue PNP** (ledger balance) — welcome, stake, missions, fee-in-PNP |
| Crash PNP | https://play.pointpay.exchange | Crash bets can use venue PNP (server rail) |
| Venue explorer | https://pointpay.exchange/explorer | PNPScan UI fed by dedicated testnet RPC |
| Public testnet explorer | https://testnet-explorer.pointpay.exchange | Same chain, public BscScan-style UI |
| Testnet RPC / LCD | `rpc-testnet` / `api-testnet`.pointpay.exchange | Dedicated node `pointpay-dedicated-1` |

## Not live / do not claim

- **Not mainnet.** Chain status is `dedicated_dev` / public testnet soak — not Cosmos Hub ICS, not ≥10 independent validators.
- **Venue PNP ≠ self-custody coin.** Hub balances are exchange ledger. Users cannot withdraw native `pnp1…` yet (bridge is Phase G — later).
- **Not BEP20 “the coin”.** Do not tell users PNP is a BSC token. Native denom is `upnp` on PointPay Chain (testnet).
- **No “Bitcoin-grade / hackproof”** wording.

## One-line answers

- “Is PNP on-chain?” → Venue PNP is custodial on PointPay. A dedicated **testnet** chain exists for explorer/dev; **mainnet self-custody is not launched.**
- “Can I send PNP to MetaMask?” → Not as the native coin today. Venue PNP stays in your PointPay account.
- “Is the explorer mainnet?” → **Testnet.** https://testnet-explorer.pointpay.exchange

## Scope freeze

Until product owners explicitly start **mainnet track**: no OSS publish, no second sentry, no bridge, no audit sprint as blockers. Fix only production bugs.
