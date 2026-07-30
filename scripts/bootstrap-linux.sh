#!/usr/bin/env bash
# Bootstrap PointPay Chain on Linux (VPS or Docker).
# Does NOT claim mainnet security until SECURITY.md checklist is complete.
set -euo pipefail

CHAIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_MODULE="${ROOT_MODULE:-github.com/pointpay/pointpay}"
IGNITE_VERSION="${IGNITE_VERSION:-v28.11.2}"
PREFIX=pnp

echo "==> PointPay Chain bootstrap in $CHAIN_DIR"

if ! command -v go >/dev/null 2>&1; then
  echo "Install Go 1.22+ first: https://go.dev/dl/"
  exit 1
fi

export PATH="$(go env GOPATH)/bin:/usr/local/go/bin:$PATH"
export DO_NOT_TRACK=1
export IGNITE_DISABLE_TELEMETRY=1
export CI=1
export GOTOOLCHAIN=auto

# Ignite scaffold pulls modern module graphs — use current Go toolchain on VPS
echo "==> Ensuring Go 1.26.5"
curl -fsSL https://go.dev/dl/go1.26.5.linux-amd64.tar.gz -o /tmp/go.tgz
rm -rf /usr/local/go
tar -C /usr/local -xzf /tmp/go.tgz
export PATH=/usr/local/go/bin:$(/usr/local/go/bin/go env GOPATH)/bin:$PATH
export GOTOOLCHAIN=local
go version

if ! command -v ignite >/dev/null 2>&1; then
  echo "==> Installing Ignite CLI ${IGNITE_VERSION} (GitHub release)"
  VER_NUM="${IGNITE_VERSION#v}"
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64|amd64) ARCH=amd64 ;;
    aarch64|arm64) ARCH=arm64 ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
  URL="https://github.com/ignite/cli/releases/download/${IGNITE_VERSION}/ignite_${VER_NUM}_linux_${ARCH}.tar.gz"
  curl -fsSL "$URL" -o /tmp/ignite.tgz
  mkdir -p "$(go env GOPATH)/bin"
  tar -xzf /tmp/ignite.tgz -C "$(go env GOPATH)/bin" ignite
  chmod +x "$(go env GOPATH)/bin/ignite"
fi

echo "==> ignite binary: $(command -v ignite)"
# Confirm CLI responds (avoid bare `ignite version` — telemetry hang on some VPSes)
timeout 30 ignite scaffold --help </dev/null >/tmp/ignite-help.txt
head -n 8 /tmp/ignite-help.txt

APP_DIR="$CHAIN_DIR/pointpay"
if [ ! -d "$APP_DIR/cmd" ]; then
  echo "==> Scaffolding chain (address-prefix ${PREFIX})"
  cd "$CHAIN_DIR"
  rm -rf pointpay
  timeout 600 ignite scaffold chain "$ROOT_MODULE" \
    --address-prefix "$PREFIX" \
    --no-module \
    --skip-git </dev/null
fi

cd "$APP_DIR"

if [ ! -d "x/pnp" ]; then
  echo "==> Scaffolding pnp economy module"
  timeout 600 ignite scaffold module pnp --params max_supply:uint </dev/null
fi

echo "==> Copy SECURITY + economy into app tree"
cp -f "$CHAIN_DIR/SECURITY.md" "$APP_DIR/SECURITY.md"
mkdir -p "$APP_DIR/genesis"
cp -f "$CHAIN_DIR/genesis/economy.json" "$APP_DIR/genesis/economy.json"

echo "==> Build (this can take several minutes)"
timeout 1800 ignite chain build </dev/null

echo "OK. Next: ignite chain serve (testnet only). Mainnet needs ≥4 validators + ceremony — see SECURITY.md"
