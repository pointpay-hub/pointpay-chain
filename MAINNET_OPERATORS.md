# Mainnet validator operators (`pointpay-1`)

**Gentx window: not open yet.** Dates will be announced on GitHub (`pointpay-hub/pointpay-chain`) after soak + ceremony readiness. See [`gentxs/README.md`](./gentxs/README.md) (submissions closed).

For **current public testnet** full nodes, use [TESTNET_OPERATORS.md](./TESTNET_OPERATORS.md) instead — start there.

## Register interest now

1. Open / comment on the GitHub issue: **Testnet full-node operators wanted** on https://github.com/pointpay-hub/pointpay-chain  
2. Run a **testnet full node** (proves ops skill; helps soak P2P)  
3. When the mainnet window opens, follow the gentx outline below  

Company nodes: max **2** bonded validators at genesis labeling; prefer 1 validator + 1 sentry ([SENTRY.md](./SENTRY.md)).

## Requirements (when window opens)

| Item | Requirement |
|------|-------------|
| Hardware | ≥4 vCPU, 8 GB RAM, 160 GB SSD (comfortable) |
| Network | Public P2P `26656`; stable uplink |
| Identity | Independent operator (not a PointPay sockpuppet farm) |
| Software | `pointpayd` built from tagged OSS release |
| Stake | Bonded amount announced with gentx instructions (fees use `upnp`) |

## Gentx outline (draft — do not run against testnet)

```bash
# After official genesis draft + binary tag are published:
pointpayd init <moniker> --chain-id pointpay-1
# Replace genesis with published draft
pointpayd keys add <key>
pointpayd genesis add-genesis-account <key> <self-delegation>upnp
pointpayd genesis gentx <key> <self-delegation>upnp --chain-id pointpay-1
# Submit gentx JSON via PR to gentxs/ (window must be OPEN)
```

PointPay will collect gentxs, produce final genesis, publish SHA-256, then announce T0 start peers.

## Forbidden

- Running mainnet validator consensus keys on the exchange host
- Advertising testnet (`pointpay-dedicated-1`) as mainnet
- Asking users to bridge venue balances before Phase G caps are live
- Submitting gentxs while [`gentxs/README.md`](./gentxs/README.md) says CLOSED
