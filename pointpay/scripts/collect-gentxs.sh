#!/usr/bin/env bash
# Collect validator gentx JSON files into a single genesis for pointpay-1.
# Usage (after gentx window):
#   ./collect-gentxs.sh ./gentxs ./genesis-draft.json ./genesis-final.json
set -euo pipefail

GENTX_DIR="${1:-./gentxs}"
DRAFT="${2:-./genesis-draft.json}"
OUT="${3:-./genesis.json}"

if [[ ! -d "$GENTX_DIR" ]]; then
  echo "Missing gentx dir: $GENTX_DIR"
  exit 1
fi
if [[ ! -f "$DRAFT" ]]; then
  echo "Missing draft genesis: $DRAFT"
  exit 1
fi
if ! command -v pointpayd >/dev/null 2>&1; then
  echo "pointpayd not in PATH"
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp "$DRAFT" "$TMP/genesis.json"
mkdir -p "$TMP/config/gentx"
cp "$GENTX_DIR"/*.json "$TMP/config/gentx/" 2>/dev/null || {
  echo "No *.json gentxs in $GENTX_DIR"
  exit 1
}

# home layout for collect-gentxs
export HOME_DIR="$TMP"
pointpayd genesis collect-gentxs --home "$TMP" 2>/dev/null || pointpayd collect-gentxs --home "$TMP"
cp "$TMP/config/genesis.json" "$OUT"
echo "Wrote $OUT"
sha256sum "$OUT"
echo "Record SHA in chain/genesis/CHECKSUMS.md under pointpay-1 before T0."
