# PointPay Chain — internal security audit pack

**Decision:** Team runs this audit themselves (no external firm required for *your* process).  
**Still required before mainnet label:** complete every checkbox below, publish a short report (GitHub issue/gist), get ≥10 validators + ceremony.  
This pack does **not** invent mint/admin backdoors — it proves you checked.

Repo under audit: https://github.com/pointpay-hub/pointpay-chain  
Scope: `pointpay/` · `x/pnp` · `genesis/` · economy scripts · explorer config (read-only)

## How to run

```bash
# from monorepo or OSS checkout
node _deploy/run-internal-audit.mjs
# or inside OSS tree:
bash scripts/run-internal-audit.sh
```

Fill dates/sign-off at the bottom after green automated checks + manual review.

---

## A — Supply & mint (critical)

- [ ] No `MsgAdminMint` / custom mint of `upnp` after genesis in `x/pnp`
- [ ] `maxSupply` / `DefaultMaxSupply` = 10M PNP (1e6 base units) and cannot be raised via `MsgUpdateParams`
- [ ] PNP module accounts have **no** `Minter` permission (only hold genesis coins)
- [ ] Cosmos `x/mint` inflation for `upnp` is **zero** at genesis (patched economy)
- [ ] Genesis total `upnp` supply = 10_000_000_000_000 base units
- [ ] Invariant `pnp/pnp-supply` registered; crisis order after pnp

## B — Seize / freeze / admin

- [ ] No freeze / blacklist / seize messages in `x/pnp`
- [ ] No exchange admin key path that rewrites on-chain balances
- [ ] `MsgUpdateParams` authority is gov/module only; max supply raise rejected

## C — Keys & infra

- [ ] Validator consensus keys **not** on exchange host `.182`
- [ ] Dedicated chain host documented; RPC rate-limited
- [ ] Testnet (`pointpay-dedicated-1`) never labeled `mainnet` in venue env
- [ ] Deploy / faucet keys disabled for mainnet binary path (`config.yml` faucet off)

## D — Genesis & ceremony readiness

- [ ] Economy numbers match `genesis/economy.json`
- [ ] Checksums process understood (`genesis/CHECKSUMS.md`)
- [ ] Gentx collect script reviewed (`pointpay/scripts/collect-gentxs.sh`)
- [ ] Destroy-keys template prepared ([MAINNET.md](./MAINNET.md))

## E — Build & tests

- [ ] `pointpayd` builds from OSS tag (`pointpay/BUILD.md`)
- [ ] Unit tests for params / supply / update-params pass (`go test ./x/pnp/...`)
- [ ] No secrets in OSS tree (no `.env`, keyrings, `_deploy` passwords)

## F — Product honesty

- [ ] Hub/support copy: venue PNP = custodial until bridge ([SUPPORT_LIVE_VS_MAINNET.md](./SUPPORT_LIVE_VS_MAINNET.md))
- [ ] No “hackproof / Bitcoin-grade live mainnet” claims before ceremony

---

## Sign-off (fill when done)

```
Internal audit date (UTC): ________
Auditors (names): ________
Automated script result: PASS / FAIL
Manual findings (summary or "none"): ________
Report URL (GitHub issue/gist): ________
Signed: ________
```

## After this pack is green

Next: company sentry + external validator invites ([MAINNET_OPERATORS.md](./MAINNET_OPERATORS.md)), then ceremony for `pointpay-1`.
