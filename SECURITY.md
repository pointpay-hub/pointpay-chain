# PointPay Chain — Security Invariants

**Goal:** Bitcoin-class *protocol* properties for native **PNP coin** (not a BEP20 token).  
**Rule:** Never market a single-operator database, exchange-VPS node, or sequencer as “hackproof.”  
**Roadmap:** [ROADMAP.md](./ROADMAP.md) (ordered phases — do not skip).

## Non-negotiable (mainnet)

1. **Fixed max supply:** `10_000_000` PNP. Prefer **entire supply created at genesis** into module/vault accounts. **No** `MsgMint` / owner mint after genesis.
2. **No seize / freeze / blacklist** of arbitrary user balances by PointPay admin keys.
3. **No exchange admin key** that can rewrite on-chain balances or halt transfers on mainnet.
4. **Open source** binary + public genesis JSON + checksums before mainnet label.
5. **Consensus security (best):** **Cosmos Hub Interchain Security** (consumer chain).  
   Fallback: large set of **independent** bonded validators — not a handful of company-controlled nodes.  
   One node = **dev only**.
6. **Dedicated infra:** production / public testnet nodes must **not** live on the PointPay exchange app server.
7. **Genesis ceremony:** temporary deploy keys destroyed with public proof; vault/sale release only via **committed module rules**.
8. **External audit** before calling mainnet production-safe.
9. **Bridge last:** capped hot float, multisig/timelock; never claim bridge ≈ Bitcoin.

## What this does *not* claim

- Absolute “hackproof” (nothing is). Strong = no admin backdoor + real consensus + transparent supply + audit.
- **Venue balances** and **bridge hot wallets** are custodial (exchange-class risk).
- Compromised bridge keys threaten **hot/bridged float only** — not every self-custodied wallet (if invariants hold).

## Trust zones

| Zone | Trust | Steal if venue hacked? |
|------|--------|-------------------------|
| User self-custody on PointPay Chain | Protocol + user keys | No (protocol goal) |
| `pnpBalance` on exchange | Custodial | Yes |
| Bridge hot keys | Custodial | Yes (limit float) |

## Upgrade / governance

Transparent governance with delay. Emergency “admin patch” that mints or seizes is **forbidden** and must not exist in modules.

## Checklist before mainnet (mirror of ROADMAP F)

- [ ] Invariants implemented and tested
- [ ] Dedicated infra (not exchange VPS)
- [ ] OSS + reproducible builds
- [ ] Long public testnet completed
- [ ] Genesis published + key destruction proof
- [ ] ICS consumer **or** large independent validator set
- [ ] Audit report published
- [ ] Hub copy: self-custody vs venue risk disclosed
- [ ] Bridge caps + monitoring (if bridge enabled)
