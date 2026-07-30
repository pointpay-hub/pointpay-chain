# PointPay Chain — internal security audit pack (FILLED)

**Decision:** Team self-audit (no external firm).  
**Repo:** https://github.com/pointpay-hub/pointpay-chain  
**Scope:** `pointpay/` · `x/pnp` · `genesis/` · economy scripts · explorer config  
**Automated:** `node _deploy/run-internal-audit.mjs` → **PASS** (12/12) on 2026-07-30  
**Deep review:** Cursor agents + manual code read + live host inspect (same date)

---

## How to re-run

```bash
node _deploy/run-internal-audit.mjs
node _deploy/verify-mainnet-freeze.mjs
node _deploy/verify-no-chain-on-182.mjs
```

---

## A — Supply & mint (critical)

- [x] No `MsgAdminMint` / custom mint of `upnp` after genesis in `x/pnp`  
  **Evidence:** Proto Msg service = `UpdateParams` only (`proto/pointpay/pnp/tx.proto`); codec registers only that; keeper has no mint; `BankKeeper` interface = `SpendableCoins` + `GetSupply` only (`types/expected_keepers.go`). `InitGenesis` only `SetParams` (`module/genesis.go`).
- [x] `maxSupply` / `DefaultMaxSupply` = 10M PNP (1e6 base) and cannot be raised via `MsgUpdateParams`  
  **Evidence:** `DefaultMaxSupply = 10_000_000_000_000` upnp (`types/constants.go`). `msg_update_params.go` rejects any `MaxSupply != cur` or `!= DefaultMaxSupply`. `params.Validate` also locks to DefaultMaxSupply.
- [x] PNP module accounts have **no** `Minter` permission  
  **Evidence:** `app_config.go` — `pnp_sale` / marketing / creator / founder / vaults `Permissions: []` + comment “NO minter”.
- [x] Cosmos `x/mint` inflation for `upnp` is **zero** at genesis (patched economy)  
  **Evidence:** `scripts/patch_genesis_economy.py` sets `mint_denom=stake`, all inflation fields `0`.  
  **WARN (W1):** App does not hardcode this — ceremony **must** run the patch. Prefer gov never set `mint_denom=upnp`.
- [x] Genesis total `upnp` supply = 10_000_000_000_000 base units  
  **Evidence:** Patch funds pools+vaults to exact `MAX_UPNP`; bank supply asserted equal. Live dedicated genesis SHA `0c2178eb…` in `CHECKSUMS.md`.
- [x] Invariant `pnp/pnp-supply` registered; crisis order after pnp  
  **Evidence:** `keeper/invariants.go` (`supply > max` breaks); registered in module; `app_config.go` InitGenesis: `pnp` then `crisis` last.  
  **WARN (W2):** Invariant is **upper bound only** (not pool-sum equality).

## B — Seize / freeze / admin

- [x] No freeze / blacklist / seize messages in `x/pnp` — grep + proto Msg surface
- [x] No exchange admin key path that rewrites on-chain balances — no hardcoded authority in `app.go`; pnp authority = gov module account
- [x] `MsgUpdateParams` authority is gov/module only; max supply raise rejected — see A

## C — Keys & infra

- [x] Validator consensus **daemon not running** on exchange host `.182`  
  **Evidence:** Live PM2 = `tradeone`, `crash-game`, `botzyai-server` only; no `pointpay-chain`; no ports 26656/26657/1317 listening.
- [x] **W8 — Leftover consensus key files on `.182`** — **CLOSED**  
  **Evidence (2026-07-30):** Archived to local gitignored `_deploy/backups/182-chain-leftover-*` then wiped `/var/www/pointpay-chain` + `/root/.pointpay`. PM2 still only tradeone/crash/botzy; never start `pointpayd` on exchange again.
- [x] Dedicated chain host `.230` documented; RPC rate-limited — `INFRA.md` + nginx HTTPS
- [x] Testnet never labeled `mainnet` in venue env — `PNP_CHAIN_STATUS=dedicated_dev`, `PNP_CHAIN_ID=pointpay-dedicated-1` (verified freeze)
- [x] Faucet off — `pointpay/config.yml`: `coins: []`, `host: ":0"`  
  **WARN (W5):** Scaffold `chain/config.yml` (repo root) weaker; use `pointpay/config.yml` for builds. Mainnet ceremony: `DEMO_UPNP=0` (W4).

## D — Genesis & ceremony readiness

- [x] Economy numbers match `genesis/economy.json` — 600k+200k+100k+100k + 9×1M = 10M  
  **W3 closed:** `patch_genesis_economy.py` loads `economy.json` (or `ECONOMY_JSON=`) and asserts pool+vault sum == maxSupply.
- [x] Checksums process understood — `genesis/CHECKSUMS.md` + dedicated SHA published
- [x] Gentx collect script reviewed — `pointpay/scripts/collect-gentxs.sh` present (draft)
- [x] Destroy-keys template prepared — `MAINNET.md`
- [ ] Company sentry on second VPS — **OPEN**
- [ ] External validators ≥10 — **OPEN**
- [ ] Gentx window executed — **OPEN**
- [ ] Mainnet genesis freeze + `verify-mainnet-freeze.mjs` green — **OPEN**
- [ ] DNS cutover + venue `PNP_CHAIN_STATUS=mainnet` — **OPEN** (after freeze only)
- [ ] Bridge Phase G — **OPEN**

## E — Build & tests

- [x] `pointpayd` builds from OSS — `BUILD.md` + public repo/tag `v0.1.0-testnet`
- [~] Unit tests — `go test ./x/pnp/module` and `./types` **PASS** on Windows; `./keeper` **blocked by host Application Control** (could not exec test binary). Stale UpdateParams test fixed to expect immutable max supply (this audit). Re-run keeper tests on Linux CI (W6).
- [x] No secrets in OSS tree — no `.env`/keyrings/`_deploy` passwords in published paths  
  **WARN:** Public docs list host IPs / SSH **env var names** (not values) — optional scrub later.

## F — Product honesty

- [x] Hub/support copy custodial vs chain — `SUPPORT_LIVE_VS_MAINNET.md`, PnpHub copy
- [x] No hackproof / fake-mainnet claims before ceremony — ROADMAP + MAINNET freeze
- [x] HTTPS RPC / LCD / explorer live for testnet — `rpc-testnet` / `api-testnet` / `testnet-explorer`

---

## Findings summary (keep for ceremony)

| ID | Severity | Item | Action before `pointpay-1` |
|----|----------|------|----------------------------|
| W1 | Medium | `x/mint` zeroing only via genesis patch | **Mitigated:** ceremony checklist in MAINNET.md; never set `mint_denom=upnp` |
| W2 | Low | Invariant = upper bound only | Optional: strengthen to track burns/pools |
| W3 | Medium | Patch ignored `economy.json` | **Closed:** script loads JSON + sum assert |
| W4 | Low | `DEMO_UPNP` default 1000 PNP | **Mitigated:** MAINNET checklist requires `DEMO_UPNP=0` |
| W5 | Low | Scaffold `chain/config.yml` faucet | Align with `pointpay/config.yml` or delete from OSS |
| W6 | Low | Keeper unit tests blocked on this Windows host | Run in Linux CI / builder |
| W7 | Info | SPEC says mint in InitGenesis; code funds via bank genesis patch | Update SPEC wording (behavior OK) |
| W8 | Medium | Leftover keys on `.182` | **Closed:** local archive + remote wipe 2026-07-30 |

**Critical path (mint/freeze/seize/max supply): PASS — no FAIL.**

---

## Sign-off

```
Internal audit date (UTC): 2026-07-30
Auditors: PointPay Hub ops + Cursor deep review + 2 explore agents (self-audit)
Automated script result: PASS (12/12)
Manual findings (summary): W3/W8 closed; W1/W4 mitigated in MAINNET ceremony checklist; residual W2/W5/W6/W7
Verdict: PASS WITH WARNINGS — continue testnet + ceremony prep; do NOT label mainnet until §D OPEN (sentry/validators/gentx/freeze)
Report URL: https://github.com/pointpay-hub/pointpay-chain/blob/main/INTERNAL_AUDIT.md
Signed: PointPay Hub (self-audit complete for Phase F prep)
```

## After this pack

Next (ordered):
1. Company sentry on 2nd VPS; open gentx window ([MAINNET_OPERATORS.md](./MAINNET_OPERATORS.md)).
2. Collect ≥10 external gentxs → freeze `pointpay-1` → then flip DNS + `PNP_CHAIN_STATUS=mainnet`.
3. Bridge Phase G last.
