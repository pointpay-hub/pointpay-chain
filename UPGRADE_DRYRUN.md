# Testnet upgrade dry-run

Practice chain upgrades on **pointpay-dedicated-1** before mainnet. Run during low-traffic windows; announce in operator channels.

## Preconditions

- [ ] Backup validator home: `/root/.pointpay` (or your `POINTPAY_HOME`)
- [ ] New `pointpayd` binary built and checksum noted
- [ ] Sentry + at least one external full node synced (optional but recommended)
- [ ] Public RPC responds: `curl -s https://rpc-testnet.pointpay.exchange/status | jq .result.sync_info`

## Dry-run steps (validator `.230`)

1. **Build / stage binary** on a jump host or directly on the validator VPS.
2. **Stop** the service:
   ```bash
   systemctl stop pointpayd   # or your unit name
   ```
3. **Replace binary**:
   ```bash
   cp /path/to/new/pointpayd /usr/local/bin/pointpayd
   pointpayd version
   ```
4. **Start** and watch logs:
   ```bash
   systemctl start pointpayd
   journalctl -u pointpayd -f
   ```
5. **Verify** within 2 minutes:
   ```bash
   curl -s http://127.0.0.1:26657/status | jq '.result.sync_info | {height:latest_block_height,catching_up}'
   ```
   `catching_up` should return to `false`.

6. **Repeat on sentry** (`pointpay-sentry` on anonvm) — non-validator, safe rehearsal.

## Chaos: RPC kill test

Simulates RPC outage; P2P and consensus should continue.

```bash
# On validator — block public RPC only (adjust if nginx proxies 26657)
iptables -I INPUT -p tcp --dport 26657 -j DROP
sleep 120
curl -s http://127.0.0.1:26657/status | jq .result.sync_info   # local still OK
iptables -D INPUT -p tcp --dport 26657 -j DROP
```

Check sentry still advances height via local RPC during the block.

## Rollback

```bash
systemctl stop pointpayd
cp /usr/local/bin/pointpayd.bak /usr/local/bin/pointpayd
systemctl start pointpayd
```

Keep previous binary as `pointpayd.bak` before every upgrade.

## Operator comms template

```
PointPay testnet upgrade window: [DATE UTC]
Expected downtime: ~2–5 min on public RPC
Action: replace pointpayd, restart node
After upgrade: run verify-testnet-sync.sh and report height
```

## Health check script

```bash
export CHAIN_FORCE_PASSWORD=1 CHAIN_SSH_PASSWORD='…'
node _deploy/ops/67-testnet-health.mjs
export ANONVM_SSH_PASSWORD='…'   # optional
node _deploy/ops/67-testnet-health.mjs
```

See also [TESTNET_STATUS.md](./TESTNET_STATUS.md).
