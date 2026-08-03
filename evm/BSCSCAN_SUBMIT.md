# BscScan — PNP coin logo & token info (checklist)

**Contract (BSC mainnet):** `0x6b778d717b3618ddc23d18b7f31134cf01af2342`  
**Symbol:** PNP · **Decimals:** 18 · **Max supply cap:** 10,000,000 (global — not all minted on BSC)

Official page: https://pointpay.exchange/pnp  
Logo file (256×256 PNG for upload): export from [`../../frontend/public/pnp-token-icon.svg`](../../frontend/public/pnp-token-icon.svg)

---

## Step 1 — Verify contract on BscScan

1. Open https://bscscan.com/verifyContract  
2. Contract: `0x6b778d717b3618ddc23d18b7f31134cf01af2342`  
3. Compiler: **v0.8.26+commit.8a97fa7a**, optimization **enabled, 200 runs**  
4. Source: [`PNP.sol`](./PNP.sol) (single file, contract name `PNP`)  
5. Constructor argument (ABI-encoded uint256):

   ```
   10000000000000000000000000
   ```

   Or use BscScan “Verify via Standard JSON” if single-file fails.

6. After verify → public can read source (trust signal).

---

## Step 2 — Update token info (logo + links)

1. Open https://bscscan.com/token/0x6b778d717b3618ddc23d18b7f31134cf01af2342  
2. **Update Token Info** (requires BscScan login; may need BSC for service fee if not verified project)  
3. Upload:

   | Field | Value |
   |-------|--------|
   | Token name | PointPay |
   | Symbol | PNP |
   | Logo | **PNG 256×256** (export SVG above — no transparency issues) |
   | Website | https://pointpay.exchange/pnp |
   | Official project email | ops@pointpay.exchange |
   | Whitepaper / docs | https://pointpay.exchange/pointpay-pnp-whitepaper.pdf |
   | Description | PointPay native coin (PNP). Max 10M worldwide. Live on PointPay exchange Hub; BSC network for MetaMask/Trust self-custody. Not a memecoin — product-backed. |

4. Submit → wait 24–72h for BscScan review.

**PNG export (local):**

- Open `frontend/public/pnp-token-icon.svg` in browser or Figma  
- Export **256×256 PNG**  
- Save as `chain/evm/assets/pnp-token-256.png` (optional backup)

---

## Step 3 — Trust Wallet logo (after BscScan)

1. Fork https://github.com/trustwallet/assets  
2. Add: `blockchains/smartchain/assets/0x6b778d717b3618ddc23d18b7f31134cf01af2342/logo.png` (256×256 PNG)  
3. `info.json` in same folder:

```json
{
  "name": "PointPay",
  "website": "https://pointpay.exchange/pnp",
  "description": "PointPay native coin (PNP) on BSC.",
  "explorer": "https://bscscan.com/token/0x6b778d717b3618ddc23d18b7f31134cf01af2342",
  "type": "BEP20",
  "symbol": "PNP",
  "decimals": 18,
  "status": "active",
  "id": "0x6b778d717b3618ddc23d18b7f31134cf01af2342"
}
```

4. Open PR → merge can take days/weeks.

---

## Step 4 — What users see after approval

| Before | After |
|--------|--------|
| Gray circle | PointPay logo on BscScan + many wallets |
| $0.00 price | Still $0 until DEX/CoinGecko (separate step) |

Wallet **price** needs PancakeSwap liquidity or CoinGecko — logo is Steps 1–3.

---

## Copy-paste (support)

> Official PNP on BSC: `0x6b778d717b3618ddc23d18b7f31134cf01af2342`  
> Verify: https://bscscan.com/token/0x6b778d717b3618ddc23d18b7f31134cf01af2342  
> Product: https://pointpay.exchange/pnp

---

## Owner wallet (mint more float only)

Deployer / owner = exchange hot wallet (for Hub withdraws).  
Do **not** mint above global 1 crore accounting — see [../PNP_WALLETS.md](../PNP_WALLETS.md).
