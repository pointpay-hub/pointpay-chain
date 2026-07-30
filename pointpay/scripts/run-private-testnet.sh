#!/usr/bin/env bash
# Full single-node PRIVATE testnet — not mainnet / not public.
set -euo pipefail

BIN="${BIN:-/var/www/pointpay-chain/bin/pointpayd}"
HOME_DIR="${HOME_DIR:-/var/www/pointpay-chain/data}"
CHAIN_ID="${CHAIN_ID:-pointpay-private-1}"
MONIKER="${MONIKER:-pp-private}"
KEYRING=test
ALICE=alice

export PATH="$(dirname "$BIN"):/usr/local/go/bin:$HOME/go/bin:$PATH"

echo "==> Reset $HOME_DIR"
rm -rf "$HOME_DIR"
"$BIN" init "$MONIKER" --chain-id "$CHAIN_ID" --home "$HOME_DIR" >/dev/null

echo "==> Key $ALICE"
"$BIN" keys add "$ALICE" --keyring-backend "$KEYRING" --home "$HOME_DIR" --output json >/tmp/pp-alice.json 2>/dev/null
ALICE_ADDR=$("$BIN" keys show "$ALICE" -a --keyring-backend "$KEYRING" --home "$HOME_DIR")

echo "==> Genesis account (bond denom only)"
"$BIN" genesis add-genesis-account "$ALICE_ADDR" "100000000000stake" --home "$HOME_DIR"

echo "==> Patch economy (10M upnp + mint inflation 0)"
SRC="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$SRC/scripts/patch_genesis_economy.py" "$HOME_DIR/config/genesis.json"

echo "==> Gentx"
"$BIN" genesis gentx "$ALICE" 100000000stake \
  --chain-id "$CHAIN_ID" \
  --keyring-backend "$KEYRING" \
  --home "$HOME_DIR"
"$BIN" genesis collect-gentxs --home "$HOME_DIR"
"$BIN" genesis validate-genesis --home "$HOME_DIR"

sed -i 's/cors_allowed_origins = \[\]/cors_allowed_origins = ["*"]/' "$HOME_DIR/config/config.toml" || true
sed -i 's/minimum-gas-prices = ""/minimum-gas-prices = "0.001upnp"/' "$HOME_DIR/config/app.toml" || true
# LCD for explorers (bind localhost — proxy publicly only on dedicated hosts)
python3 - <<PY || true
from pathlib import Path
import re
p = Path("${HOME_DIR}/config/app.toml")
t = p.read_text()
m = re.search(r"(?ms)^\[api\].*?(?=^\[|\Z)", t)
if m:
    b = m.group(0)
    b = re.sub(r"(?m)^enable\s*=\s*.*$", "enable = true", b, count=1)
    b = re.sub(r"(?m)^swagger\s*=\s*.*$", "swagger = true", b, count=1)
    b = re.sub(r'(?m)^address\s*=\s*.*$', 'address = "tcp://127.0.0.1:1317"', b, count=1)
    if "enabled-unsafe-cors" in b:
        b = re.sub(r"(?m)^enabled-unsafe-cors\s*=\s*.*$", "enabled-unsafe-cors = true", b, count=1)
    else:
        b = b.rstrip() + "\nenabled-unsafe-cors = true\n"
    t = t[: m.start()] + b + t[m.end() :]
    p.write_text(t)
PY

if [ "${INIT_ONLY:-0}" = "1" ]; then
  echo "==> INIT_ONLY complete"
  exit 0
fi

echo "==> Starting pointpayd (private) home=$HOME_DIR"
exec "$BIN" start --home "$HOME_DIR"
