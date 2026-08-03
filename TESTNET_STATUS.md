# PointPay testnet — live status & remaining work

**Last updated:** 2026-08-03  
**Chain-id:** `pointpay-dedicated-1` (testnet only — **not mainnet**)

Single source of truth for ops: what is live, what is syncing, and what to do next.  
Operator join steps: [TESTNET_OPERATORS.md](./TESTNET_OPERATORS.md) · Sentry details: [SENTRY.md](./SENTRY.md) · Infra: [INFRA.md](./INFRA.md)

---

## Strategy (confirmed)

1. **Testnet first** — fix bugs, PNPScan, RPC, deploy scripts, collect operators.
2. **Validators grow on testnet** — sentry → full nodes → optional 2nd bonded validator (separate VPS).
3. **Soak 1–3+ months** — upgrades, chaos tests, external peers.
4. **Mainnet later** — new servers, new keys, gentx ceremony (`pointpay-1`), audit. **Never** flip testnet box to “fake mainnet.”
5. **Exchange product** (`pointpay.exchange`) runs in parallel on venue ledger — chain mainnet is not required for trading UI.

Testnet extra cost ≈ **one cheap VPS (~$9/mo)** on top of existing `.230` box. Mainnet = additional servers + ceremony (see [MAINNET.md](./MAINNET.md)).

---

## Host inventory

| Host | IP | Role | Status |
|------|-----|------|--------|
| `chain-testnet` | `176.123.2.230:2222` | Validator + public RPC/LCD + PNPScan nginx | **Live** |
| `pp-sentry-server1` | `31.59.151.61` | Company **sentry** (non-validating full node) | **Synced** ✅ |
| `tradeone` | `185.139.214.182` | Exchange app only — **no validator keys** | Live |

### Validator (`.230`)

- PM2: `pointpay-chain`
- Binary: `/var/www/pointpay-chain/bin/pointpayd`
- Seed node id: `5fa037a21adfe1f681bb7cf86602de39a7fd5c22@176.123.2.230:26656`

### Sentry (anonvm — Netherlands)

- Moniker: `pp-sentry-server1`
- Node id: `d75ad4bf5eab13325c92dccae2f28786da016524`
- Home: `/var/lib/pointpay-sentry`
- Service: `systemctl status pointpay-sentry`
- P2P: `26656` (ufw open)
- RPC: localhost `26657` only
- SSH: key `~/.ssh/id_ed25519_sentry` (installed on server)

**Peer string (add to `peers.json` after `catching_up=false`):**

```
d75ad4bf5eab13325c92dccae2f28786da016524@31.59.151.61:26656
```

Check sync:

```bash
ssh -i ~/.ssh/id_ed25519_sentry root@31.59.151.61 \
  'curl -s http://127.0.0.1:26657/status | jq .result.sync_info'
```

---

## Public endpoints

| Service | URL |
|---------|-----|
| PNPScan | https://testnet-explorer.pointpay.exchange/ |
| RPC | https://rpc-testnet.pointpay.exchange |
| LCD | https://api-testnet.pointpay.exchange |
| Genesis | https://testnet-explorer.pointpay.exchange/genesis.json |
| Peers | https://testnet-explorer.pointpay.exchange/peers.json |
| Venue explorer (exchange proxy) | https://pointpay.exchange/explorer |

Genesis SHA-256: `0c2178eb2742b3572f8d651a6ca76e8d6622434a830644d0a50e5fc28c267040` ([genesis/CHECKSUMS.md](./genesis/CHECKSUMS.md))

---

## Completed ✅

### PNPScan (testnet explorer)

- Path on server: `/var/www/pointpay-explorer/` (not `/var/www/pnpscan`)
- Source: `chain/explorer/public/`
- Features: Blockchain menu, BscScan-style **More** mega-menu + tools, validators leaderboard, silent background refresh (no loading flash)
- Deploy:

```powershell
$env:CHAIN_FORCE_PASSWORD='1'
$env:CHAIN_SSH_PASSWORD='…'   # or BOTZY_SSH_PASSWORD
node _deploy/ops/65-deploy-pnpscan-testnet.mjs
```

Config: `_deploy/chain-server.config.json` → `explorerDir: /var/www/pointpay-explorer`

### Sentry bootstrap

- Scripts: `chain/scripts/bootstrap-sentry-ubuntu.sh`, `_deploy/ops/66-bootstrap-anonvm-sentry.mjs`
- `pointpayd` copied from `.230` via SFTP (do not build on 4 GB box unless needed)
- systemd unit: `pointpay-sentry.service`

### Exchange (production)

- Landing institutional at `/` (A/B removed)
- PNP-first markets, browser-side 24h change enrichment, fake DIES prices removed
- Deploy: `node _deploy/update.mjs` (exchange host `.182`)

---

## In progress 🔄

_None — sentry sync complete. See remaining ops below._

---

## Remaining — priority order

### Immediate (ops)

- [x] Confirm sentry `catching_up=false` — height **~82785**, synced 2026-08-03
- [x] Add sentry to https://testnet-explorer.pointpay.exchange/peers.json
- [ ] Rotate anonvm **panel/root password** (never commit passwords to git)
- [ ] Optional: disable password SSH after key login verified

### Testnet growth (weeks–months)

- [x] Operator recruitment pack — [OPERATORS_WANTED.md](./OPERATORS_WANTED.md) + GitHub issue template
- [x] Public join page — https://testnet-explorer.pointpay.exchange/join.html (deploy with `65-deploy-pnpscan-testnet.mjs`)
- [x] Join script uses live **peers.json** (seed + sentry + extras)
- [x] `chain/scripts/verify-testnet-sync.sh` — sync check + peer string for registration
- [x] Health report — `_deploy/ops/67-testnet-health.mjs`
- [x] Upgrade dry-run doc — [UPGRADE_DRYRUN.md](./UPGRADE_DRYRUN.md)
- [x] **Post** GitHub issue — [#2 operators wanted](https://github.com/pointpay-hub/pointpay-chain/issues/2)
- [ ] Invite **external full-node operators** (share issue link)
- [ ] Optional **2nd validator** on separate VPS (`create-validator` — not on exchange or same IP as validator)
- [ ] Run upgrade dry-run + chaos (RPC kill test) per UPGRADE_DRYRUN.md
- [x] Keep PNPScan fixes deployed via `65-deploy-pnpscan-testnet.mjs`

### Optional product

- [x] Sync venue `pointpay.exchange/explorer` — embeds full testnet PNPScan iframe
- [ ] Server-side 24h `change24h` on VPS if external API access improves (browser workaround live on landing)

### Mainnet (later — do not rush)

- [ ] Security audit
- [ ] Gentx window open ([MAINNET_OPERATORS.md](./MAINNET_OPERATORS.md)) — currently **closed**
- [ ] ≥10 independent validators target
- [ ] **New** mainnet servers + keys (`pointpay-1`) — see [MAINNET.md](./MAINNET.md)
- [ ] Bridge / EVM last ([ROADMAP.md](./ROADMAP.md))

---

## How to add validators (testnet)

1. Separate VPS (Ubuntu 22.04, ≥4 GB RAM, ≥60 GB disk, port 26656).
2. Join: `chain/scripts/join-testnet-node.sh` or [TESTNET_OPERATORS.md](./TESTNET_OPERATORS.md).
3. After sync, submit `create-validator` tx (needs `upnp` for self-delegation).
4. Appears on PNPScan → Validators after bonded.

**Do not:** run validator on exchange `.182` or copy `.230` consensus keys.

Recommended VPS: **Linux Ubuntu 22.04** — not Windows/GPU. Minimum 2 vCPU / 4 GB; comfortable 4 vCPU / 8 GB / 120 GB NVMe.

---

## Deploy & ops scripts

| Script | Purpose |
|--------|---------|
| `scripts/ops/65-deploy-pnpscan-testnet.mjs` | Upload PNPScan to chain host |
| `scripts/ops/66-bootstrap-anonvm-sentry.mjs` | Bootstrap sentry from validator binary |
| `scripts/ops/66b-probe-anonvm.mjs` | SSH health check sentry |
| `scripts/ops/chain-lib.mjs` | SSH helper for chain box |
| `scripts/ops/67-testnet-health.mjs` | Public RPC + validator + sentry health report |

Auth for chain box: `CHAIN_SSH_PASSWORD` or `BOTZY_SSH_PASSWORD`, port **2222**.  
Config: copy [chain-server.config.example.json](./chain-server.config.example.json) → `chain-server.config.json` (gitignored — **never commit passwords**).

`peers.json` refresh uses SSH on the chain host — keep that script private; contact ops to list your peer after sync.

### Exchange monorepo (private GitHub)

- Repo: **pointpay-hub/pointpay-exchange** (private — no `.env`, deploy passwords, or HD mnemonics)
- Public chain code: [pointpay-chain](https://github.com/pointpay-hub/pointpay-chain) · [pnpscan](https://github.com/pointpay-hub/pnpscan)

---

| Item | Cost |
|------|------|
| Chain testnet `.230` | Existing |
| Sentry anonvm (2 vCPU / 4 GB) | ~$9/mo |
| Mainnet (future) | Separate budget — multiple VPS + audit |

Testnet can be **shut down** after mainnet stable to save ~$9/mo.

---

## Security reminders

- Never commit `.env`, SSH passwords, or panel credentials.
- Never run consensus on `185.139.214.182`.
- Do not label testnet as mainnet in UI or marketing.
- Rotate any password that was shared in chat or screenshots.
