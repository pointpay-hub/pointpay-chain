# Genesis checksums (private-dev / testnet drafts)

Publish hashes before inviting external operators. **Private-dev is not mainnet.**

## `pointpay-private-1` (private-dev on exchange VPS — disposable)

| Field | Value |
|-------|--------|
| Chain ID | `pointpay-private-1` |
| Genesis file | `/var/www/pointpay-chain/data/config/genesis.json` |
| SHA-256 | `fbcddfbc07c3fd889d30f1bc3acd5569bb6c190475aeb0a14bb1a28fbdf275c6` |
| Recorded | 2026-07-29 |
| Economy | Full **10,000,000 PNP** (`10000000000000` upnp) at genesis into sale / marketing / creator / founder + vaults 2026–2034; mint inflation `0`; `pnp.params.maxSupply` = max |
| Demo | Validator `alice` funded with 1000 PNP for gas + explorer smoke txs |

```bash
sha256sum /var/www/pointpay-chain/data/config/genesis.json
# expect: fbcddfbc07c3fd889d30f1bc3acd5569bb6c190475aeb0a14bb1a28fbdf275c6
```

Regenerate after any intentional re-init:

```bash
export INIT_ONLY=1
bash chain/pointpay/scripts/run-private-testnet.sh
sha256sum $HOME_DIR/config/genesis.json
```

## `pointpay-dedicated-1` (dedicated host `.230` — private/testnet-style; not public mainnet)

| Field | Value |
|-------|--------|
| Chain ID | `pointpay-dedicated-1` |
| Host | `176.123.2.230:2222` — `/var/www/pointpay-chain` |
| Genesis file | `/var/www/pointpay-chain/data/config/genesis.json` |
| SHA-256 | `0c2178eb2742b3572f8d651a6ca76e8d6622434a830644d0a50e5fc28c267040` |
| Recorded | 2026-07-29 |
| Economy | Same 10M PNP genesis rules as private-dev; mint inflation `0`; RPC/LCD localhost-only; P2P `26656` open |
| Status | Active single-node (PM2 `pointpay-chain`); exchange `.182` private-dev stopped after cutover |
| Public copy | https://testnet-explorer.pointpay.exchange/genesis.json |
| Peers | https://testnet-explorer.pointpay.exchange/peers.json |

```bash
sha256sum /var/www/pointpay-chain/data/config/genesis.json
# expect: 0c2178eb2742b3572f8d651a6ca76e8d6622434a830644d0a50e5fc28c267040
curl -sL https://testnet-explorer.pointpay.exchange/genesis.json | sha256sum
```

## Public testnet (Phase E — TBD)

| Field | Value |
|-------|--------|
| Chain ID | `pointpay-testnet-1` (planned) |
| SHA-256 | _publish with first public genesis_ |

## Mainnet `pointpay-1` (Phase F — not launched)

| Field | Value |
|-------|--------|
| Chain ID | `pointpay-1` |
| Genesis file | _TBD after gentx ceremony_ |
| SHA-256 | _publish at T0 — never reuse dedicated-1 genesis_ |
| Docs | [`../MAINNET.md`](../MAINNET.md) · [`../MAINNET_OPERATORS.md`](../MAINNET_OPERATORS.md) |
| Collect gentxs | `pointpay/scripts/collect-gentxs.sh` |

**Freeze:** Live venue must stay on `pointpay-dedicated-1` / `dedicated_dev` until ceremony + audit + ≥10 validators.
