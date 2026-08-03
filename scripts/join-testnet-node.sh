#!/usr/bin/env bash
# Join PointPay testnet using live peers.json (seed + company sentry + extras).
# Requires: pointpayd, curl, jq
set -euo pipefail

HOME_DIR="${1:-$HOME/.pointpay-testnet}"
CHAIN_ID="pointpay-dedicated-1"
MONIKER="${MONIKER:-pp-full-$(hostname -s 2>/dev/null || echo node)}"
PEERS_JSON="${PEERS_JSON:-https://testnet-explorer.pointpay.exchange/peers.json}"
GENESIS_URL="${GENESIS_URL:-https://testnet-explorer.pointpay.exchange/genesis.json}"
EXPECT_SHA="0c2178eb2742b3572f8d651a6ca76e8d6622434a830644d0a50e5fc28c267040"

for cmd in pointpayd curl jq; do
  command -v "$cmd" >/dev/null || { echo "Missing: $cmd"; exit 1; }
done

echo "==> Fetch peers.json"
DOC="$(curl -fsSL "$PEERS_JSON")"
SEED="$(echo "$DOC" | jq -r '.seed')"
PEER_LIST="$(echo "$DOC" | jq -r '([.seed] + (.peers // [])) | unique | join(",")')"
echo "Seed: $SEED"
echo "Persistent peers: $PEER_LIST"

mkdir -p "$HOME_DIR"
export POINTPAY_HOME="$HOME_DIR"

if [[ ! -f "$HOME_DIR/config/genesis.json" ]]; then
  pointpayd init "$MONIKER" --chain-id "$CHAIN_ID" --home "$HOME_DIR"
  curl -fsSL "$GENESIS_URL" -o "$HOME_DIR/config/genesis.json"
else
  echo "Existing home — skip init"
fi

SUM="$(sha256sum "$HOME_DIR/config/genesis.json" | awk '{print $1}')"
echo "genesis sha256=$SUM"
[[ "$SUM" == "$EXPECT_SHA" ]] || { echo "Genesis checksum mismatch"; exit 3; }

CFG="$HOME_DIR/config/config.toml"
set_cfg() {
  local key="$1" val="$2"
  if grep -q "^${key}" "$CFG" 2>/dev/null; then
    sed -i.bak "s|^${key} *=.*|${key} = \"${val}\"|" "$CFG"
  else
    echo "${key} = \"${val}\"" >>"$CFG"
  fi
}

set_cfg "seeds" "$SEED"
set_cfg "persistent_peers" "$PEER_LIST"
sed -i.bak 's|^addr_book_strict *=.*|addr_book_strict = true|' "$CFG" 2>/dev/null || true
sed -i.bak 's|^cors_allowed_origins *=.*|cors_allowed_origins = []|' "$CFG" 2>/dev/null || true
sed -i.bak 's|laddr = "tcp://0.0.0.0:26657"|laddr = "tcp://127.0.0.1:26657"|' "$CFG" 2>/dev/null || true

echo ""
echo "Ready. Start:"
echo "  pointpayd start --home $HOME_DIR"
echo "Verify:"
echo "  chain/scripts/verify-testnet-sync.sh"
echo ""
echo "Join page: https://testnet-explorer.pointpay.exchange/join.html"
