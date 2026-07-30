# Mainnet validator operators (`pointpay-1`)

**Not open yet.** Gentx window dates will be announced on GitHub (`pointpay-hub/pointpay-chain`) after audit scheduling.

For **current public testnet** full nodes, use [TESTNET_OPERATORS.md](./TESTNET_OPERATORS.md) instead.

## Requirements (when window opens)

| Item | Requirement |
|------|-------------|
| Hardware | ≥4 vCPU, 8 GB RAM, 160 GB SSD (comfortable) |
| Network | Public P2P `26656`; stable uplink |
| Identity | Independent operator (not a PointPay sockpuppet farm) |
| Software | `pointpayd` built from tagged OSS release |
| Stake | Bonded amount announced with gentx instructions (ATOM-denominated gas uses `upnp`) |

## Gentx outline (draft)

```bash
# After official genesis draft + binary tag are published:
pointpayd init <moniker> --chain-id pointpay-1
# Replace genesis with published draft
pointpayd keys add <key>
pointpayd genesis add-genesis-account <key> <self-delegation>upnp
pointpayd genesis gentx <key> <self-delegation>upnp --chain-id pointpay-1
# Submit gentx JSON via GitHub PR / form (URL TBD)
```

PointPay will collect gentxs, produce final genesis, publish SHA-256, then announce T0 start peers.

## Company nodes

- Max **2** bonded validators controlled by PointPay at genesis labeling.
- Prefer 1 validator + 1 sentry on separate AS/IP from exchange `.182`.

## Forbidden

- Running mainnet validator consensus keys on the exchange host
- Advertising testnet (`pointpay-dedicated-1`) as mainnet
- Asking users to bridge venue balances before Phase G caps are live
