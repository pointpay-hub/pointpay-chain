# PointPay Chain — Security Invariants

**Goal:** Bitcoin-class *protocol* properties for native **PNP coin** (not a BEP20 token).  
**Rule:** Never market a single-operator database or sequencer as “hackproof.”

## Non-negotiable (mainnet)

1. **Fixed max supply:** `10_000_000` PNP enforced in consensus. No `MsgMint` / owner mint after genesis.
2. **No seize / freeze / blacklist** of arbitrary user balances by PointPay admin keys.
3. **No exchange admin key** that can rewrite on-chain balances or halt transfers on mainnet.
4. **Open source** binary + public genesis JSON + checksums before mainnet label.
5. **CometBFT multi-validator:** mainnet requires **≥ 4** independent validators. One node = **dev/testnet only**.
6. **Genesis ceremony:** temporary deploy keys destroyed or publicly burned; vault/sale release only via **committed module rules**, not a hot private key on the venue server.
7. **External audit** before calling mainnet production-safe.

## What this does *not* claim

- Absolute “hackproof” (nothing is). BTC-like = no admin backdoor + decentralized consensus + transparent supply.
- **Venue balances** and **bridge hot wallets** are custodial (exchange-class risk). Users should withdraw to **self-custody** for protocol-level safety.
- Compromised bridge keys can only threaten **hot/bridged float**, not every self-custodied wallet (if invariants hold).

## Trust zones

| Zone | Trust | Steal if venue hacked? |
|------|--------|-------------------------|
| User self-custody wallet on PointPay Chain | Protocol + user keys | No (protocol goal) |
| `pnpBalance` on exchange | Custodial | Yes |
| Bridge hot keys | Custodial | Yes (limit float) |

## Upgrade / governance

Chain upgrades via transparent governance with delay. Emergency “admin patch” that mints or seizes is **forbidden** by policy and must not exist in modules.

## Checklist before mainnet

- [ ] Invariants implemented and tested
- [ ] Genesis published + key destruction proof
- [ ] ≥4 validators online
- [ ] Audit report published
- [ ] Bridge limits + monitoring live
- [ ] Hub copy: self-custody vs venue risk disclosed
