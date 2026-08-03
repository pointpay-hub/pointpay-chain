#!/usr/bin/env bash
# Verify PointPay testnet node sync and print peer string for operator registration.
set -euo pipefail

RPC="${RPC:-http://127.0.0.1:26657}"
PUBLIC_IP="${PUBLIC_IP:-}"

echo "==> RPC: $RPC"
STATUS="$(curl -fsSL "$RPC/status")"
echo "$STATUS" | jq .

SYNC="$(echo "$STATUS" | jq -r '.result.sync_info')"
CUP="$(echo "$SYNC" | jq -r '.catching_up')"
HEIGHT="$(echo "$SYNC" | jq -r '.latest_block_height')"
NODE_ID="$(echo "$STATUS" | jq -r '.result.node_info.id')"
MONIKER="$(echo "$STATUS" | jq -r '.result.node_info.moniker')"

echo ""
echo "Moniker: $MONIKER"
echo "Node ID: $NODE_ID"
echo "Height:  $HEIGHT"
echo "catching_up: $CUP"

if [[ "$CUP" != "false" ]]; then
  echo ""
  echo "NOT READY — wait until catching_up=false before registering."
  exit 1
fi

if [[ -z "$PUBLIC_IP" ]]; then
  PUBLIC_IP="$(curl -fsSL -4 https://ifconfig.me 2>/dev/null || curl -fsSL -4 https://api.ipify.org 2>/dev/null || true)"
fi

if [[ -n "$PUBLIC_IP" ]]; then
  echo ""
  echo "=== Register this peer string on GitHub (OPERATORS_WANTED.md) ==="
  echo "${NODE_ID}@${PUBLIC_IP}:26656"
else
  echo ""
  echo "Set PUBLIC_IP=your.vps.ip and re-run to print peer string."
fi

echo ""
echo "Public tip (compare heights):"
curl -fsSL https://rpc-testnet.pointpay.exchange/status | jq -r '.result.sync_info | "network height=\(.latest_block_height) catching_up=\(.catching_up)"'
