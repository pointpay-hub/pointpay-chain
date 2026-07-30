# Contributing to `pointpayd`

See [../ROADMAP.md](../ROADMAP.md) and [../SECURITY.md](../SECURITY.md) before proposing consensus or mint changes.

## Rules

1. **No post-genesis mint** of `upnp`. Max supply is fixed (`DefaultMaxSupply`).
2. **No freeze/seize** messages. Reject PRs that add admin clawback.
3. Do not put validator mnemonics, `.env`, or server configs in git.
4. Prefer Cosmos Hub ICS / independent validators for mainnet — not a single company box.

## Build

```bash
cd chain/pointpay
export GOTOOLCHAIN=local
make install   # or see BUILD.md
```

## Tests

```bash
go test ./x/pnp/...
```

## Genesis economy

Edit numbers only via [`../genesis/economy.json`](../genesis/economy.json) + `scripts/patch_genesis_economy.py`. Recompute supply; never hand-edit bank supply out of sync with balances.

## License

Apache-2.0 — see [LICENSE](./LICENSE).
