#!/usr/bin/env bash
# Provision a DEDICATED Ubuntu host for PointPay Chain (testnet / later mainnet).
# Do NOT run on the exchange (tradeone) VPS.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/pointpay-chain}"
USER_NAME="${USER_NAME:-pointpay}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates ufw jq python3 build-essential git

# Dedicated OS user (no login shell required for systemd later)
id -u "$USER_NAME" >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin "$USER_NAME"
mkdir -p "$APP_DIR"/{bin,data,src,logs}
chown -R "$USER_NAME":"$USER_NAME" "$APP_DIR"

# Firewall: P2P public; RPC/LCD localhost until nginx is ready
ufw allow OpenSSH || true
ufw allow 26656/tcp comment 'cometbft p2p' || true
ufw --force enable || true

echo "==> Base provision complete"
echo "    APP_DIR=$APP_DIR"
echo "    Next: copy pointpayd binary + src, then INIT_ONLY private/testnet scripts"
echo "    Public RPC/LCD: only via nginx rate-limit reverse proxy (see INFRA.md)"
echo "    NEVER store mainnet keys on the exchange tradeone host"
