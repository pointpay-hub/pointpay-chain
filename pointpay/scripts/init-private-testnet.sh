#!/usr/bin/env bash
# Init a PRIVATE single-node testnet (dev only — not mainnet).
# Requires: pointpayd on PATH, python3, jq
set -euo pipefail

CHAIN_ID="${CHAIN_ID:-pointpay-private-1}"
MONIKER="${MONIKER:-pp-private}"
HOME_DIR="${HOME_DIR:-$HOME/.pointpay-private}"
KEYRING="${KEYRING:-test}"

echo "==> Home $HOME_DIR chain-id $CHAIN_ID"
rm -rf "$HOME_DIR"
pointpayd init "$MONIKER" --chain-id "$CHAIN_ID" --home "$HOME_DIR"

GENESIS="$HOME_DIR/config/genesis.json"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

python3 "$SCRIPT_DIR/patch_genesis_economy.py" "$GENESIS"

# Soft zero-inflation mint (stake denom only — does not mint upnp)
pointpayd genesis validate-genesis --home "$HOME_DIR" || true

echo "==> Private genesis ready at $GENESIS"
echo "Start: pointpayd start --home $HOME_DIR"
echo "NOTE: single-node private testnet only. See chain/ROADMAP.md"
