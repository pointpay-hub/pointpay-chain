# PointPay Chain — Mainnet program (`pointpay-1`)

**Status:** Preparation only. **Not launched.**  
Today’s live node `pointpay-dedicated-1` is **testnet / dedicated_dev** — do **not** label it mainnet.

## Non-negotiable before `PNP_CHAIN_STATUS=mainnet`

Mirror of [SECURITY.md](./SECURITY.md) + ROADMAP Phase F:

1. Public OSS: `https://github.com/pointpay-hub/pointpay-chain`
2. External **security audit** published
3. **≥10 independent bonded validators** at genesis (company ≤2 of them)
4. Genesis **ceremony** + deploy-key destruction proof
5. Public genesis SHA-256 + explorer on mainnet DNS
6. Hub copy: venue custodial vs self-custody disclosed

**Hard stop:** Never rename `pointpay-dedicated-1` to mainnet. Mainnet uses a **new** chain-id.

## Targets

| Item | Value |
|------|--------|
| Chain-id | `pointpay-1` |
| Denom | `upnp` (display **PNP**, 6 decimals) |
| Max supply | 10,000,000 PNP — all at genesis (same economy rules as testnet) |
| Consensus | Independent validators (ICS later, optional) |
| RPC / LCD / Explorer (planned) | `rpc.pointpay.exchange` · `api.pointpay.exchange` · `explorer.pointpay.exchange` |
| Testnet (keep) | `rpc-testnet` / `api-testnet` / `testnet-explorer` |

## Phases

### A — OSS (done)

- Repo: https://github.com/pointpay-hub/pointpay-chain (binary + docs)
- Explorer UI OSS: https://github.com/pointpay-hub/pnpscan
- Tag: `v0.1.0-testnet` (dedicated-1 genesis SHA in CHECKSUMS.md)

### B — Operators

- Company: 1 validator + 1 sentry (different IP/AS)
- Recruit ≥8 external validators — see [MAINNET_OPERATORS.md](./MAINNET_OPERATORS.md)
- Collect gentxs in a published window

### C — Audit (self)

- Team runs [INTERNAL_AUDIT.md](./INTERNAL_AUDIT.md) + `node _deploy/run-internal-audit.mjs`
- Scope: `pointpay/` · `x/pnp` · genesis/economy scripts
- Publish filled sign-off (GitHub issue on `pointpay-chain`) before ceremony

### D — Ceremony (T0)

1. Freeze gentx deadline  
2. Build final `genesis.json` for `pointpay-1`  
3. Publish SHA-256 in `genesis/CHECKSUMS.md`  
4. All validators start together  
5. Publish **destroy deploy keys** proof (checklist below)  
6. Only then: DNS + venue env → mainnet endpoints  

### E — After mainnet live (still no bridge)

Venue may set:

```env
PNP_CHAIN_STATUS=mainnet
PNP_CHAIN_ID=pointpay-1
PNP_CHAIN_RPC=https://rpc.pointpay.exchange
PNP_CHAIN_LCD=https://api.pointpay.exchange
PNP_CHAIN_EXPLORER_URL=https://explorer.pointpay.exchange/
```

Users still hold **custodial** venue PNP until Phase G bridge.

## Destroy-keys proof template (fill at ceremony)

```
Date (UTC): ________
Chain-id: pointpay-1
Genesis SHA-256: ________
Deploy key fingerprints destroyed: ________
Witness / notary or public livestream: ________
Signed by: ________
```

## Freeze (current production)

| Env | Must remain until ceremony |
|-----|----------------------------|
| `PNP_CHAIN_STATUS` | `dedicated_dev` (not `mainnet`) |
| `PNP_CHAIN_ID` | `pointpay-dedicated-1` |
| Public testnet DNS | `*-testnet.pointpay.exchange` |

Verified by ops: do not flip these in `_deploy/wire-chain-explorer-230.mjs` or server `.env` for a “fake mainnet.”
