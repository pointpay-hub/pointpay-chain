# PointPay public testnet — operator guide (Phase E)

**Chain-id:** `pointpay-dedicated-1`  
**Status:** Dedicated single-validator soak — **not mainnet**. Do not stake real money.

For the future **mainnet** (`pointpay-1`) gentx program, see [MAINNET_OPERATORS.md](./MAINNET_OPERATORS.md) — do not confuse the two.

## Public endpoints

| Service | URL |
|---------|-----|
| Explorer (PNPScan) | https://testnet-explorer.pointpay.exchange/ |
| RPC | https://rpc-testnet.pointpay.exchange |
| LCD / REST | https://api-testnet.pointpay.exchange |
| P2P (seed) | `176.123.2.230:26656` |
| Genesis | https://testnet-explorer.pointpay.exchange/genesis.json |
| Peers JSON | https://testnet-explorer.pointpay.exchange/peers.json |

**Current seed peer** (refresh via `/status` if this drifts):

```
5fa037a21adfe1f681bb7cf86602de39a7fd5c22@176.123.2.230:26656
```

```bash
curl -s https://rpc-testnet.pointpay.exchange/status | jq -r .result.node_info.id
curl -s https://testnet-explorer.pointpay.exchange/peers.json | jq .
```

## Who should run a node

| Role | Purpose |
|------|---------|
| **Full node / sentry** | Independent RPC, verify state, help soak P2P |
| **Company sentry** | PointPay 2nd VPS — see [SENTRY.md](./SENTRY.md) (non-validating) |
| **Validator (later)** | Only after multi-node genesis / gentx ceremony — not for this single-node genesis |

Today’s genesis has **one** bonded validator. External operators should join as **non-validating full nodes** first.

## Register interest

Comment on the GitHub issue **Testnet full-node operators wanted** in https://github.com/pointpay-hub/pointpay-chain with:

- Operator name / contact  
- Your planned peer string (`id@ip:26656`) after sync  
- Whether you want to be considered for future `pointpay-1` gentx  

Mainnet gentx is **not** open yet — see [MAINNET_OPERATORS.md](./MAINNET_OPERATORS.md).

## Quick join (Ubuntu 22.04+)

```bash
# 1) Install deps + build pointpayd (see pointpay/BUILD.md)
sudo apt-get update && sudo apt-get install -y build-essential git jq curl
# Go 1.26.5+ recommended — see pointpay/BUILD.md

# 2) Or use the helper script from this repo:
chmod +x scripts/join-testnet-node.sh
./scripts/join-testnet-node.sh /data/pointpay-testnet
```

Manual outline:

1. `pointpayd init <moniker> --chain-id pointpay-dedicated-1`
2. Replace `~/.pointpay/config/genesis.json` with the published genesis (checksum in [`genesis/CHECKSUMS.md`](./genesis/CHECKSUMS.md))
3. Set `persistent_peers` / `seeds` to `<node_id>@176.123.2.230:26656`
4. Open **outbound** 26656; optional inbound 26656 if you want to be a peer
5. **Do not** enable unsafe CORS on public RPC without rate limits
6. Start: `pointpayd start` (or systemd / PM2)

## Safety rules

- Never put validator consensus keys on the exchange host (`tradeone` / `.182`)
- Do not advertise this chain as mainnet or “Bitcoin-grade”
- Report consensus / halt issues to ops@pointpay.exchange
- Genesis SHA-256 must match [`genesis/CHECKSUMS.md`](./genesis/CHECKSUMS.md)

## After you sync

1. Confirm `catching_up=false` on `/status`
2. Optionally expose a private RPC for your team
3. Ping PointPay with your peer string so we can add you to a public peer list

## Next (still Phase E)

- [x] Publish rotating public peer list — `peers.json` + `node _deploy/publish-peers.mjs`
- [ ] Second company sentry (different AS / DC) — scripts ready ([SENTRY.md](./SENTRY.md)); waiting on 2nd VPS
- [ ] Chaos: kill RPC, upgrade dry-run, state-sync doc
- [x] Invite external full-node operators — GitHub issue + this guide
