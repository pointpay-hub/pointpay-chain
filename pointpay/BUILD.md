# Building `pointpayd` from source

See also [../SECURITY.md](../SECURITY.md) and [../ROADMAP.md](../ROADMAP.md).

## Requirements

- Go **1.26.x** (matches `go.mod`; set `GOTOOLCHAIN=local`)
- Linux/macOS recommended for Ignite tooling; binary builds work with Go alone
- Make optional — `go install` is enough

## Build

```bash
cd chain/pointpay
export GOTOOLCHAIN=local
go install -ldflags "-checklinkname=0 \
  -X github.com/cosmos/cosmos-sdk/version.Name=pointpay \
  -X github.com/cosmos/cosmos-sdk/version.AppName=pointpayd \
  -X github.com/cosmos/cosmos-sdk/version.Version=$(git describe --always --dirty 2>/dev/null || echo dev)" \
  -mod=readonly ./cmd/pointpayd

pointpayd version
```

Or: `make install` (includes `-checklinkname=0` for Go 1.23+ / sonic).

Docker:

```bash
docker build -t pointpayd:local chain/pointpay
```

## Private testnet (dev only)

```bash
export BIN=$(go env GOPATH)/bin/pointpayd
export HOME_DIR=$HOME/.pointpay-private
export INIT_ONLY=1
./scripts/run-private-testnet.sh
# then: pointpayd start --home $HOME_DIR
```

## Genesis checksum (publish on public testnet)

```bash
sha256sum $HOME_DIR/config/genesis.json
```

Record the hash in release notes before inviting external operators.
