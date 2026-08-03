# Deploy PNP coin on BSC (MetaMask / Trust)

**PNP coin** on BNB Smart Chain — same brand, same **global 1 crore cap** (not a separate 1 crore on BSC).

## Remix deploy

1. https://remix.ethereum.org → paste [`PNP.sol`](./PNP.sol)  
2. Compiler **0.8.20+**, network **BSC**  
3. Constructor `_maxSupply`:

   ```
   10000000000000000000000000
   ```

   (10M × 10^18 — **ceiling only**)

4. After deploy: **`mint` only hot-wallet float** (e.g. 50,000–500,000 PNP) — **NOT full 1 crore**

## MetaMask / Trust

| Field | Value |
|-------|--------|
| Network | BNB Smart Chain |
| Contract | your address |
| Symbol | PNP |
| Decimals | 18 |

## PointPay Hub

```env
PNP_EVM_WITHDRAW_ENABLED=true
PNP_BEP20_CONTRACT=0x...
PNP_BEP20_DECIMALS=18
PNP_EVM_MIN_WITHDRAW=10
PNP_EVM_DAILY_CAP=50000
```

Hot wallet = same as USDT deposits. Needs **PNP + BNB gas**.

## Global cap reminder

Every withdraw from Hub **moves** PNP from custodial balance to BSC — total worldwide stays ≤ 1 crore. See [../PNP_WALLETS.md](../PNP_WALLETS.md).
