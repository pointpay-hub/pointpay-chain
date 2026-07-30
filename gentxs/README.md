# Gentxs for mainnet `pointpay-1`

**Status: CLOSED** — do not submit gentx JSON yet.

The mainnet gentx window opens only after:

1. Public announcement on https://github.com/pointpay-hub/pointpay-chain (dated release / issue)
2. Binary tag + draft genesis published
3. Operator guide: [MAINNET_OPERATORS.md](../MAINNET_OPERATORS.md)

Until then:

- Join **testnet** as a full node: [TESTNET_OPERATORS.md](../TESTNET_OPERATORS.md)
- Register interest on the GitHub issue *Testnet full-node operators wanted*

When the window opens, drop one `*.json` gentx per validator in this folder (via PR) and coordinators run:

```bash
./pointpay/scripts/collect-gentxs.sh ./gentxs ./genesis-draft.json ./genesis.json
```

Do **not** submit gentxs for `pointpay-dedicated-1` (testnet).
