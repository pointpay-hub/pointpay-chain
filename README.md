# PointPay Chain

Native **PNP coin** (not a BEP20 token) — Cosmos SDK + CometBFT.

**Read in order:** [ROADMAP.md](./ROADMAP.md) → [SECURITY.md](./SECURITY.md) → [INFRA.md](./INFRA.md) → [genesis/economy.json](./genesis/economy.json) → [x/pnp/SPEC.md](./x/pnp/SPEC.md) → binary source [`pointpay/`](./pointpay/)

## Locked direction (Jul 2026)

Best path even if hard: dedicated infra, all supply at genesis (no mint key), long public testnet, **Cosmos Hub ICS** (preferred) or real independent validators, audit + ceremony, **bridge last**. Venue PNP fayde continue on the exchange ledger until then.

## Denom / addresses

| | |
|--|--|
| Display | `PNP` |
| Base | `upnp` (6 decimals) — `1 PNP = 1_000_000 upnp` |
| Bech32 | prefix `pnp` → `pnp1...` |

## Dev bootstrap (Linux only — not production)

Ignite has no solid Windows CLI build. Use **dedicated** Linux/CI — do **not** treat the exchange (`tradeone`) VPS as permanent chain home.

```bash
cd chain
chmod +x scripts/bootstrap-linux.sh
./scripts/bootstrap-linux.sh   # scaffold/build experiment
# Public testnet / mainnet: separate hosts — see ROADMAP Phase B+
```

## Security vs venue

| Where PNP sits | Trust |
|----------------|--------|
| User wallet on PointPay Chain | Protocol + user keys (goal) |
| Exchange `pnpBalance` | Custodial |
| Bridge hot keys | Custodial — limit float; ship last |
