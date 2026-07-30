#!/usr/bin/env bash
# Join PointPay dedicated testnet as a non-validating full node.
# Usage: ./join-testnet-node.sh [home_dir]
set -euo pipefail

HOME_DIR="${1:-$HOME/.pointpay-testnet}"
CHAIN_ID="pointpay-dedicated-1"
MONIKER="${MONIKER:-pp-full-$(hostname -s 2>/dev/null || echo node)}"
SEED_ID="${SEED_ID:-5fa037a21adfe1f681bb7cf86602de39a7fd5c22}"
SEED_HOST="${SEED_HOST:-176.123.2.230}"
SEED_P2P="${SEED_P2P:-26656}"
PEER="${SEED_ID}@${SEED_HOST}:${SEED_P2P}"
RPC_STATUS="${RPC_STATUS:-https://rpc-testnet.pointpay.exchange/status}"
GENESIS_URL="${GENESIS_URL:-https://testnet-explorer.pointpay.exchange/genesis.json}"

if ! command -v pointpayd >/dev/null 2>&1; then
  echo "pointpayd not in PATH. Build from chain/pointpay (see BUILD.md) first."
  exit 1
fi

echo "Home: $HOME_DIR"
echo "Peer: $PEER"
echo "Fetching live seed id (optional refresh)…"
LIVE_ID="$(curl -fsSL "$RPC_STATUS" | jq -r '.result.node_info.id // empty' || true)"
if [[ -n "$LIVE_ID" && "$LIVE_ID" != "null" ]]; then
  PEER="${LIVE_ID}@${SEED_HOST}:${SEED_P2P}"
  echo "Updated peer: $PEER"
fi

mkdir -p "$HOME_DIR"
export POINTPAY_HOME="$HOME_DIR"
# binary may use --home
pointpayd init "$MONIKER" --chain-id "$CHAIN_ID" --home "$HOME_DIR"

GENESIS_DST="$HOME_DIR/config/genesis.json"
EXPECT_SHA="0c2178eb2742b3572f8d651a6ca76e8d6622434a830644d0a50e5fc28c267040"
curl -fsSL "$GENESIS_URL" -o "$GENESIS_DST"
SUM="$(sha256sum "$GENESIS_DST" | awk '{print $1}')"
echo "genesis sha256=$SUM"
if [[ "$SUM" != "$EXPECT_SHA" ]]; then
  echo "Genesis checksum mismatch (see chain/genesis/CHECKSUMS.md)."
  exit 3
fi

CFG="$HOME_DIR/config/config.toml"
# persistent_peers
if grep -q '^persistent_peers' "$CFG"; then
  sed -i.bak "s|^persistent_peers *=.*|persistent_peers = \"$PEER\"|" "$CFG"
else
  echo "persistent_peers = \"$PEER\"" >>"$CFG"
fi
# safer public defaults
sed -i.bak 's|^cors_allowed_origins *=.*|cors_allowed_origins = []|' "$CFG" || true
sed -i.bak 's|^addr_book_strict *=.*|addr_book_strict = true|' "$CFG" || true

echo ""
echo "Ready. Start with:"
echo "  pointpayd start --home $HOME_DIR"
echo "Confirm sync:"
echo "  curl -s http://127.0.0.1:26657/status | jq .result.sync_info"
echo ""
echo "This joins as a FULL NODE only (not a new genesis validator)."
