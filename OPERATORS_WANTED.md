# Testnet operators wanted

**Chain:** `pointpay-dedicated-1` (testnet — not mainnet)  
**Goal:** Independent full nodes + future validators before mainnet (`pointpay-1`).

Copy this file into a [GitHub issue](https://github.com/pointpay-hub/pointpay-chain/issues/new) on `pointpay-hub/pointpay-chain`, or post on Discord/Telegram/X.

---

## Issue title

```
[Testnet] Full-node operators wanted — PointPay Chain (pointpay-dedicated-1)
```

## Issue body (copy below)

```markdown
## PointPay public testnet — operators wanted

We are looking for **independent operators** to run non-validating **full nodes** on our public Cosmos testnet. After sync and soak, active operators may be invited to the future **mainnet gentx** program (`pointpay-1` — not open yet).

### Network

| Item | Value |
|------|-------|
| Chain ID | `pointpay-dedicated-1` |
| Explorer | https://testnet-explorer.pointpay.exchange/ |
| RPC | https://rpc-testnet.pointpay.exchange |
| LCD | https://api-testnet.pointpay.exchange |
| Peers | https://testnet-explorer.pointpay.exchange/peers.json |
| Genesis | https://testnet-explorer.pointpay.exchange/genesis.json |

### Requirements

- Ubuntu 22.04 LTS (server, not desktop)
- ≥ 2 vCPU, ≥ 4 GB RAM, ≥ 60 GB SSD
- Outbound internet; **inbound TCP 26656** if you want others to peer with you
- **Do not** run on shared exchange/hosting with unrelated production keys

### Quick join

```bash
# After installing pointpayd (see chain/pointpay/BUILD.md):
curl -fsSL https://raw.githubusercontent.com/pointpay-hub/pointpay-chain/main/chain/scripts/join-testnet-node.sh -o join-testnet-node.sh
chmod +x join-testnet-node.sh
./join-testnet-node.sh /var/lib/pointpay-testnet
pointpayd start --home /var/lib/pointpay-testnet
```

One-page guide: https://testnet-explorer.pointpay.exchange/join.html

Verify sync:

```bash
curl -s http://127.0.0.1:26657/status | jq .result.sync_info
# catching_up must be false
```

### Register your node

Comment on this issue with:

1. **Moniker** (public name)
2. **Peer string** — `<node_id>@<your_public_ip>:26656` (after sync)
3. **Contact** (email or GitHub)
4. **Role** — full node / interested in validator later
5. **Approx sync date**

We will add verified peers to https://testnet-explorer.pointpay.exchange/peers.json

### Rules

- Testnet only — no real-money staking claims
- No mainnet gentx until ceremony is announced ([MAINNET_OPERATORS.md](../MAINNET_OPERATORS.md))
- Report consensus issues to ops@pointpay.exchange

Docs: [TESTNET_OPERATORS.md](../TESTNET_OPERATORS.md) · [TESTNET_STATUS.md](../TESTNET_STATUS.md)
```

---

## Social post (short)

```
PointPay Chain public testnet is open for full-node operators.

Explorer: https://testnet-explorer.pointpay.exchange/
Join guide: https://testnet-explorer.pointpay.exchange/join.html
Chain ID: pointpay-dedicated-1

Run a node → comment your peer string on GitHub (pointpay-hub/pointpay-chain).
Mainnet gentx later — testnet soak first.
```

---

## After an operator registers

1. Verify their node reaches `catching_up=false` (ask for `/status` output).
2. Add peer to `peers.json`:

```bash
export SENTRY_PEER='existing@host:26656'   # keep existing if any
export EXTRA_PEERS='newnodeid@1.2.3.4:26656'
export CHAIN_FORCE_PASSWORD=1
export CHAIN_SSH_PASSWORD='…'   # never commit — env only
export EXTRA_PEERS='newnodeid@1.2.3.4:26656'
# Contact ops to refresh peers.json on the explorer (SSH script not in public repo)
```

3. Update [TESTNET_STATUS.md](./TESTNET_STATUS.md) operator count (optional).
