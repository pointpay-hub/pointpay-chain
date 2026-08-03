#!/bin/bash
# PointPay testnet — non-validating full node (sentry) bootstrap for Ubuntu 22.04
# Run on the new VPS as root (Console or SSH):
#   curl -fsSL https://testnet-explorer.pointpay.exchange/bootstrap-sentry.sh | bash
# Or paste this file contents in anonvm Console.
set -euo pipefail

CHAIN_ID="pointpay-dedicated-1"
HOME_DIR="/var/lib/pointpay-sentry"
MONIKER="pp-sentry-$(hostname -s | tr '[:upper:]' '[:lower:]' | head -c 20)"
SEED="5fa037a21adfe1f681bb7cf86602de39a7fd5c22@176.123.2.230:26656"
GENESIS_URL="https://testnet-explorer.pointpay.exchange/genesis.json"
GENESIS_SHA="0c2178eb2742b3572f8d651a6ca76e8d6622434a830644d0a50e5fc28c267040"
BIN="/usr/local/bin/pointpayd"

echo "==> Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl jq ca-certificates ufw

echo "==> Firewall (SSH + P2P)"
ufw allow 22/tcp
ufw allow 26656/tcp
ufw --force enable

echo "==> pointpayd binary"
if [[ ! -x "$BIN" ]]; then
  echo "ERROR: $BIN not found — upload from chain box first."
  exit 1
fi
"$BIN" version || { echo "pointpayd not runnable"; exit 1; }

echo "==> Init + genesis"
mkdir -p "$HOME_DIR"
export POINTPAY_HOME="$HOME_DIR"
if [[ ! -f "$HOME_DIR/config/genesis.json" ]]; then
  "$BIN" init "$MONIKER" --chain-id "$CHAIN_ID" --home "$HOME_DIR"
  curl -fsSL "$GENESIS_URL" -o "$HOME_DIR/config/genesis.json"
else
  echo "Existing home — skip init"
fi
SUM=$(sha256sum "$HOME_DIR/config/genesis.json" | awk '{print $1}')
echo "genesis sha256=$SUM"
[[ "$SUM" == "$GENESIS_SHA" ]] || echo "WARN: genesis checksum differs from CHECKSUMS.md"

CFG="$HOME_DIR/config/config.toml"
sed -i "s|^persistent_peers *=.*|persistent_peers = \"$SEED\"|" "$CFG" 2>/dev/null || echo "persistent_peers = \"$SEED\"" >>"$CFG"
sed -i 's|^addr_book_strict *=.*|addr_book_strict = true|' "$CFG" || true
# Local RPC only — expose via nginx later if needed
sed -i 's|laddr = "tcp://0.0.0.0:26657"|laddr = "tcp://127.0.0.1:26657"|' "$CFG" || true

echo "==> systemd service"
cat >/etc/systemd/system/pointpay-sentry.service <<EOF
[Unit]
Description=PointPay testnet sentry
After=network-online.target

[Service]
Type=simple
User=root
Environment=POINTPAY_HOME=$HOME_DIR
ExecStart=$BIN start --home $HOME_DIR
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now pointpay-sentry

echo ""
echo "==> Sync status (wait for catching_up=false)"
sleep 3
curl -s http://127.0.0.1:26657/status | jq -r '.result.sync_info | "height=\(.latest_block_height) catching_up=\(.catching_up)"' || true
echo ""
echo "Done. Sentry moniker: $MONIKER"
echo "Peer string for publish-peers (after sync):"
curl -s http://127.0.0.1:26657/status | jq -r '.result.node_info | "\(.id)@\(.listen_addr)"' || true
