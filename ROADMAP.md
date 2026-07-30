# PointPay Chain — ROADMAP (do not skip)

**Locked decision (Jul 2026):** Best path even if hard. No short-cuts.  
**Detail:** [SECURITY.md](./SECURITY.md) · [genesis/economy.json](./genesis/economy.json) · [x/pnp/SPEC.md](./x/pnp/SPEC.md)

## What we are building

| | |
|--|--|
| **Asset** | **PNP native coin** on PointPay Chain (gas + transfer) |
| **Not** | BEP20/ERC20 “token”, venue-only IOU marketed as coin, single-server DB “chain” |
| **Stack** | Cosmos SDK + CometBFT |
| **Supply** | Max **10,000,000** — prefer **all minted once at genesis** into locked module accounts; **no post-genesis mint** in binary |
| **Mainnet security** | Prefer **Cosmos Hub Interchain Security (consumer chain)**; else large **independent** validator set (not company sockpuppets) |

## Parallel track (exchange — keep shipping)

Venue utility can run for a long time without rushing mainnet:

- [x] Capped sale inventory / vaults ledger (`pnpEconomy`)
- [x] Welcome pack, fee-in-PNP, Hub, stake (venue)
- [x] Boost / missions / referral (venue)
- [x] Crash-game PNP split (venue)
- [x] ~~Honest PoR / hot-wallet funding~~ — **removed from product** (not required for venue ship; public PoR page/APIs off)

**Rule:** Do **not** advertise “Bitcoin-grade live chain” until Phase E–F below are done.

**Product-complete freeze (Jul 2026):** Exchange + venue PNP is the ship target. Skip OSS GitHub, sentry VPS, Ping.pub clone, and Phase F–G (audit / ICS / bridge) until explicitly unfrozen. Support copy: [`SUPPORT_LIVE_VS_MAINNET.md`](./SUPPORT_LIVE_VS_MAINNET.md). Smoke: `node _deploy/smoke-critical-path.mjs`.

---

## Phase checklist (ordered — do not skip)

### A — Spec freeze
- [x] SECURITY invariants written
- [x] Genesis economy numbers written
- [x] Module design SPEC (`x/pnp`)
- [x] BUSINESS_PLAN + this ROADMAP updated
- [x] Product copy audited: never call BEP20 “the coin”; venue = custodial

### B — Dedicated infra (not exchange VPS)
- [x] Infra docs (`INFRA.md`) + example chain server config
- [x] Docker Compose + `pointpayd` Dockerfile (pinned Go 1.26.5)
- [x] CI workflow (`.github/workflows/pointpayd-build.yml`)
- [x] Go build pin + `-checklinkname=0` (sonic/Go linker)
- [x] Policy: keys/consensus never on `tradeone` exchange box
- [x] **Provision real dedicated host** — `176.123.2.230:2222` (`pointpay-dedicated-1`, PM2 `pointpay-chain`); config `_deploy/chain-server.config.json`

### C — Harden binary
- [x] Import `pointpayd` tree into `chain/pointpay/` (OSS-ready path)
- [x] Disable Ignite faucet in `config.yml`
- [x] Mint inflation zeroed at genesis (`patch_genesis_economy.py`)
- [x] Full **10M** upnp into sale/marketing/creator/founder + 9 vault module accounts at genesis
- [x] Supply invariant `pnp/pnp-supply` + crisis order after pnp
- [x] Max supply param locked to 10M PNP (immutable via MsgUpdateParams)
- [x] Address prefix `pnp`; denom `upnp` / display `PNP`, 6 decimals
- [x] Private single-node testnet path `/var/www/pointpay-chain` (dev only — not mainnet)
- [x] Dedicated single-node on `.230` (`pointpay-dedicated-1`); consensus moved off exchange `.182`

### D — Open source
- [x] LICENSE (Apache-2.0 in `chain/pointpay/`)
- [x] Build from source docs (`chain/pointpay/BUILD.md`)
- [x] CONTRIBUTING + [`OSS_PUBLISH.md`](./OSS_PUBLISH.md) checklist
- [x] Public GitHub — [`pointpay-hub/pointpay-chain`](https://github.com/pointpay-hub/pointpay-chain) + [`pointpay-hub/pnpscan`](https://github.com/pointpay-hub/pnpscan); tag `v0.1.0-testnet`
- [x] Genesis draft + checksums published (private-dev) — see [`genesis/CHECKSUMS.md`](./genesis/CHECKSUMS.md)

### E — Long public testnet
- [x] Public RPC / API proxies on dedicated `.230` (HTTPS: `rpc-testnet` / `api-testnet` + Let’s Encrypt)
- [x] Host provision script [`scripts/provision-ubuntu.sh`](./scripts/provision-ubuntu.sh) + [`_deploy/bootstrap-dedicated-chain.mjs`](../_deploy/bootstrap-dedicated-chain.mjs)
- [x] **Block explorer** — BscScan-style `https://testnet-explorer.pointpay.exchange/` + venue `/explorer`
- [~] Full Ping.pub clone optional; branded PNPScan SPA shipped (`chain/explorer/public/`)
- [ ] External operators invited to run nodes — see [`TESTNET_OPERATORS.md`](./TESTNET_OPERATORS.md)
- [ ] Months of soak (not 1-week “mainnet”)
- [ ] Chaos / upgrade dry-runs

### F — Mainnet readiness
- [x] Mainnet program docs — [`MAINNET.md`](./MAINNET.md) + [`MAINNET_OPERATORS.md`](./MAINNET_OPERATORS.md) (chain-id `pointpay-1`; **not** renaming dedicated-1)
- [x] Freeze: live env stays `dedicated_dev` / `pointpay-dedicated-1` until ceremony
- [ ] External **security audit** published
- [ ] Genesis **key ceremony** + destroy deploy keys (public proof)
- [ ] ≥10 independent bonded validators (ICS optional later)
- [ ] **Block explorer (mainnet)** — `explorer.pointpay.exchange` (testnet explorer stays)
- [ ] Hub / site copy: self-custody vs venue custody
- [ ] Incident / upgrade governance policy (no emergency mint/seize)

### G — Bridge last (after F)
- [ ] Multisig / timelock bridge
- [ ] Hard caps + monitoring on hot float
- [ ] Venue withdraw/deposit to `pnp1…` self-custody
- [ ] Public disclosure of custody risk
- [ ] Raise caps only with proven ops history

### H — Optional later (never confuse with “the coin”)
- [ ] Wrapped PNP on BSC/ETH for liquidity — labeled **wrap**, not the coin
- [ ] IBC to other Cosmos chains
- [ ] DEX listings of native or wrap

---

## Explicit rejects (never “temporary”)

- BEP20 as the official coin
- Production consensus on the PointPay exchange server
- Unaudited mainnet with real user balances
- Uncapped bridge / single hot-key treasury
- “Hackproof” marketing slogans
- Short-cut sequencer/DB coin “until we migrate”

## Status snapshot

| Item | State |
|------|--------|
| Spec / SECURITY / ROADMAP | Done |
| Venue PNP utility | Live (ledger) |
| `chain/pointpay` source + Docker/CI | In repo |
| Dedicated host `.230` (`pointpay-dedicated-1`) | **Live** — `/var/www/pointpay-chain`, PM2 `pointpay-chain`; genesis in [`CHECKSUMS.md`](./genesis/CHECKSUMS.md) — **not** public mainnet |
| Exchange `.182` private-dev | Stopped after cutover (cold data may remain) |
| Genesis checksum | [`genesis/CHECKSUMS.md`](./genesis/CHECKSUMS.md) |
| OSS publish | **Live** — [pointpay-chain](https://github.com/pointpay-hub/pointpay-chain) · [pnpscan](https://github.com/pointpay-hub/pnpscan) · tag `v0.1.0-testnet` |
| Mainnet program | [`MAINNET.md`](./MAINNET.md) — prep only; **no mainnet label yet** |
| Dedicated cloud host provisioned | **Done** — `176.123.2.230:2222` (`chain-testnet`) |
| Public HTTPS RPC / LCD / explorer | **Live testnet** — rpc/api/testnet-explorer.pointpay.exchange |
| Mainnet / audit / ≥10 vals / bridge | Not started — follow MAINNET.md |
