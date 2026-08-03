# PointPay company sentry (testnet)

**Role:** Non-validating full node that peers with the dedicated validator (`.230`).  
**Not** a second bonded validator. **Never** run gentx / create-validator from this host.

## Why

- Keeps P2P + optional private RPC off the single validator box
- Soak path before mainnet (`pointpay-1`) ceremony
- Must sit on a **different IP/AS** from exchange `.182` and preferably different DC from `.230`

## Hard rules

| Rule | Detail |
|------|--------|
| No consensus bonding | Do not run `gentx` / `create-validator` on sentry |
| No exchange host | Never install on `185.139.214.182` (tradeone) |
| Not twin of validator keys | Fresh `node_key` only; do not copy `priv_validator_key.json` from `.230` |
| RPC | Bind localhost; expose only via nginx + rate limit if public |
| P2P | Open `26656` inbound if you want others to dial this sentry |

## Bootstrap (ops)

1. Buy/provision Ubuntu 22.04+ VPS (see [INFRA.md](./INFRA.md) sizing).
2. Add a `sentry` block to `_deploy/chain-server.config.json` (see `chain-server.config.example.json`).
3. Auth: `SENTRY_SSH_PASSWORD` or key path under `sentry.privateKeyPath`.
4. Run:

```bash
# Fetches pointpayd from dedicated .230, syncs published genesis, PM2 name pointpay-sentry
node _deploy/bootstrap-sentry.mjs
```

Phases: `SENTRY_BOOT_PHASE=all|provision|push|init|start|verify`

5. Confirm:

```bash
curl -s http://127.0.0.1:26657/status | jq .result.sync_info
# catching_up should become false
```

6. Publish peer string into explorer `peers.json` (see below).

## Peer publish

On `.230` after sentry is online:

```bash
# Appends sentry to peers.json (reads live status + SENTRY_PEER env)
node _deploy/publish-peers.mjs
```

Or set:

```bash
export SENTRY_PEER='<sentry_node_id>@<sentry_public_ip>:26656'
node _deploy/publish-peers.mjs
```

Public file: https://testnet-explorer.pointpay.exchange/peers.json

## After mainnet ceremony

Rebuild sentry against `pointpay-1` genesis (new home dir). Do **not** reuse testnet validator keys. Company still ≤2 bonded validators; sentry remains non-validating.

## Status

| Item | State |
|------|--------|
| Docs + `_deploy/ops/66-bootstrap-anonvm-sentry.mjs` | Ready |
| Live company sentry VPS | **Synced** — `31.59.151.61` (`pp-sentry-server1`) |
| Peer in public `peers.json` | **Published** |

See [TESTNET_STATUS.md](./TESTNET_STATUS.md) for full checklist.
