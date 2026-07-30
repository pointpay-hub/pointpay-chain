# PointPay Chain explorers

BSCScan-style UX for native PNP: blocks, txs, addresses, `upnp` balances.

| Network | URL (planned) | Status |
|---------|----------------|--------|
| Dedicated PNPScan | `https://testnet-explorer.pointpay.exchange/` | Live BscScan-style UI — `_deploy/setup-pingpub-230.mjs` |
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
