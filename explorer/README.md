# PointPay Chain explorers

BSCScan-style UX for native PNP: blocks, txs, addresses, `upnp` balances.

| Network | URL (planned) | Status |
|---------|----------------|--------|
## PNPScan features (testnet)

| Menu | Route | Source |
|------|-------|--------|
| Transactions | `#/txs` | Last ~80 blocks via RPC |
| Pending Transactions | `#/pending` | Tendermint `unconfirmed_txs` |
| View Blocks | `#/blocks` | RPC block headers |
| Top Accounts | `#/accounts` | LCD balances · recent activity |
| Validators | `#/validators` | LCD staking |
| PNP Token | `#/token/pnp` | LCD bank supply |

**More ▾ (BscScan-style mega menu):** Unit/Base64/UTF-8/Block-Date converters, Message Type lookup, API docs, Broadcast tx, CSV export, Tx decoder/encoder, Balance & Supply checkers. EVM-only items (Verify Contract, Vyper, Bytecode…) show Cosmos N/A with BscScan link.

Deploy: copy `public/` to the explorer nginx root on `.230` (see `chain/INFRA.md`).

**Ops checklist:** [../TESTNET_STATUS.md](../TESTNET_STATUS.md) · Deploy: `node scripts/ops/65-deploy-pnpscan-testnet.mjs` (from chain repo root; SSH via env)
| IP fallback | `http://176.123.2.230:8080/` | Same UI |
| Venue PNPScan | `https://pointpay.exchange/explorer` | Live — proxies dedicated RPC/LCD |
| Public testnet DNS | `https://testnet-explorer.pointpay.exchange` | Pending A record + certbot |
| Mainnet | e.g. `https://explorer.pointpay.exchange` | Phase F — **required** |

## Stack

1. **Ping.pub light explorer** (recommended) — reads LCD/RPC only, no indexer DB.  
   Config: [`chains/testnet/pointpay.json`](./chains/testnet/pointpay.json)
2. **PointPay Hub page** `/chain` — branded status + recent blocks (venue-hosted, uses public API)

## Node prerequisites

In `app.toml`:

```toml
[api]
enable = true
swagger = true
address = "tcp://0.0.0.0:1317"
enabled-unsafe-cors = true
```

RPC (`config.toml`): prefer reverse-proxy + rate limit for public exposure; private-dev may bind localhost and proxy via nginx.

## Docker (Ping.pub)

```bash
# After cloning https://github.com/ping-pub/explorer and copying our chain json:
# cp chain/explorer/chains/testnet/pointpay.json <explorer>/chains/testnet/
# Then build/run per their installation.md — map port 8088
```

See [`docker-compose.yml`](./docker-compose.yml) for a stub that mounts our chain config.
