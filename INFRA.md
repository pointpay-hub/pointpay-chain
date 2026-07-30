# PointPay Chain — dedicated infrastructure

**Rule:** Consensus, validator keys, and public RPC must **not** live on the PointPay exchange app server (`tradeone` / `pointpay.exchange` app host).

## Buy / size (public testnet — Phase E)

| Spec | Minimum | Comfortable |
|------|---------|-------------|
| vCPU | 2 | 4 |
| RAM | 4 GB | 8 GB |
| Disk | 80 GB SSD | 160 GB+ NVMe |
| OS | Ubuntu 22.04/24.04 | same |
| Network | 1 TB transfer | unmetered preferred |

Start with **1 validator** (first public testnet week), then add sentry + external operators.

DNS (add A records → `176.123.2.230`, then `node _deploy/setup-testnet-dns-tls.mjs`):

| Name | Points to |
|------|-----------|
| `rpc-testnet.pointpay.exchange` | dedicated host nginx → `127.0.0.1:26657` |
| `api-testnet.pointpay.exchange` | dedicated host nginx → `127.0.0.1:1317` (LCD) |
| `testnet-explorer.pointpay.exchange` | same box light explorer UI (`setup-pingpub-230.mjs`) |

**Live (Jul 2026):** HTTPS via Let’s Encrypt —
`https://rpc-testnet.pointpay.exchange` · `https://api-testnet.pointpay.exchange`.
IP fallback still works: `http://176.123.2.230/rpc` · `/lcd` · explorer `http://176.123.2.230:8080/`.
For `testnet-explorer` hostname + cert: Cloudflare proxy must be **DNS only**, then re-run certbot.

## Host roles

| Role | Purpose | Notes |
|------|---------|--------|
| `chain-ci` | Reproducible builds (GitHub Actions or build VPS) | Docker `golang:1.26.5` pin |
| `chain-testnet-1..N` | Public testnet validators / sentries | Months soak — ROADMAP Phase E |
| `explorer-testnet` | Public block explorer UI + API (BSCScan-like) | txs, blocks, addresses |
| `chain-mainnet-*` | Mainnet / ICS consumer | Only after audit + ceremony |
| `explorer-mainnet` | Mainnet explorer | Required for self-custody trust |

## Provision checklist (each chain host)

1. Fresh Linux (Ubuntu 22.04+), **not** shared with exchange Postgres/PM2 `tradeone`
2. Run [`scripts/provision-ubuntu.sh`](./scripts/provision-ubuntu.sh) as root
3. Fill `_deploy/chain-server.config.json` → run `node _deploy/bootstrap-dedicated-chain.mjs`
4. Build `pointpayd` on host (Go 1.26+) or copy CI artifact to `/var/www/pointpay-chain/bin/`
5. Firewall: open CometBFT P2P `26656`; RPC/LCD **only** via nginx + rate limit + HTTPS
6. Never commit mnemonics; store validator keys in encrypted volume / HSM later
7. Record host inventory in a private ops doc (not in git)

### Nginx sketch (RPC)

```nginx
limit_req_zone $binary_remote_addr zone=rpc:10m rate=10r/s;
server {
  server_name rpc-testnet.pointpay.exchange;
  listen 443 ssl;
  # ssl_certificate …;
  location / {
    limit_req zone=rpc burst=20;
    proxy_pass http://127.0.0.1:26657;
    add_header Access-Control-Allow-Origin *;
  }
}
```

LCD similarly on `1317`. Do **not** expose `26657`/`1317` on `0.0.0.0` without a proxy.

## Build (reproducible)

```bash
docker compose -f chain/docker-compose.yml build
# Or: cd chain/pointpay && make install
```

Binary name: `pointpayd`. Makefile uses `-checklinkname=0` for Go 1.23+ / sonic.

## Example private config (gitignored)

Copy [`../_deploy/chain-server.config.example.json`](../_deploy/chain-server.config.example.json) → `_deploy/chain-server.config.json` when you have a dedicated host.

## Host inventory (ops)

| Host | SSH | Role | Notes |
|------|-----|------|--------|
| `176.123.2.230` | port **2222** | `chain-testnet` (dedicated) | Active: `pointpay-dedicated-1`, PM2 `pointpay-chain`. Nginx: `/rpc/`→26657, `/lcd/`→1317 (+ hostnames when DNS ready). Auth via `CHAIN_SSH_PASSWORD` / `BOTZY_SSH_PASSWORD`. **Not** public mainnet. |
| `185.139.214.182` | key (`server.config.json`) | exchange | `tradeone` / crash / botzy — **no** consensus after cutover; cold `/var/www/pointpay-chain` backup OK |

## Exchange VPS

May hold a **copy of source** and cold private-dev data for PNPScan later. Must **not** run production/public validators or hold mainnet keys. After dedicated `.230` cutover, stop PM2 `pointpay-chain` on `.182` only.
