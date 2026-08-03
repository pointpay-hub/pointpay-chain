# PointPay (PNP) — Whitepaper

**Version:** 1.0  
**Date:** July 2026  
**Network:** PointPay Exchange · BNB Smart Chain (BEP20 rail) · PointPay Chain (roadmap)  
**Official:** [https://pointpay.exchange/pnp](https://pointpay.exchange/pnp)  
**Contract (BSC):** `0x6b778d717b3618ddc23d18b7f31134cf01af2342`

---

## Abstract

**PNP (PointPay)** is the native coin of the PointPay exchange ecosystem. It is designed as a **utility coin with a hard global cap**, not an unlimited mint token. PNP powers trading benefits, staking, in-platform games, community rewards, and—over time—self-custody on PointPay’s own blockchain.

Only **10% of total supply** enters circulation at genesis through structured pools. The remaining **90%** is held in **time-locked year vaults** and enters circulation only through **real platform activity**: trading, staking, missions, referrals, and ecosystem participation. There is **no uncapped mint**.

This document explains the economic design, utility, demand drivers, security philosophy, community vision, and roadmap—including PointPay Chain testnet, mainnet, and cross-network rails.

---

## 1. Introduction

### 1.1 Vision

PointPay exists to make digital finance **accessible, transparent, and useful**—not speculative noise. PNP is the coin that ties the exchange, games, rewards, and future chain together under **one brand, one cap, one supply ledger**.

We believe a credible coin must answer three questions honestly:

1. **Why does it exist?** — Real utility inside a live product.
2. **Why is supply limited?** — Hard cap with published rules, not hidden mint keys.
3. **Why would someone hold it?** — Fee savings, rewards, access, and participation in a growing ecosystem—not promises of guaranteed returns.

PNP is built on that foundation.

### 1.2 What PNP is — and is not

| PNP **is** | PNP **is not** |
|------------|----------------|
| PointPay’s native ecosystem coin | An anonymous memecoin |
| Capped at **10,000,000** globally | Unlimited “print on demand” supply |
| Utility across Hub, trading, games, stake | A replacement for BTC/ETH as money |
| Verifiable BSC contract + public supply API | A separate 1 crore per network |
| A long-term chain + exchange strategy | A short-term promotional token |

---

## 2. Token economics

### 2.1 Maximum supply — one cap, all networks

**Global maximum: 10,000,000 PNP (1 crore display; 10 million in standard notation).**

This cap applies **across all rails combined**:

- PointPay Hub (custodial venue balance)
- BSC BEP20 (MetaMask / Trust self-custody withdraw)
- Future PointPay Chain native coin (`pnp1…` addresses)
- Burned supply (permanently removed)

Moving PNP from Hub → BSC **does not create new coins**. It **relocates** existing supply within the same global cap.

Public breakdown: `GET /api/public/pnp/supply`

### 2.2 Genesis release — 10% at launch

At genesis, **1,000,000 PNP (10%)** is allocated to structured liquid pools:

| Pool | Allocation | Purpose |
|------|------------|---------|
| **Sale inventory** | 600,000 PNP | User purchases on Hub / spot — no infinite mint when pool is used |
| **Marketing & community** | 200,000 PNP | Missions, referrals, welcome rewards, campaigns |
| **Creator / ecosystem** | 100,000 PNP | Builders, integrations, long-term ecosystem growth |
| **Founder reserve** | 100,000 PNP | Aligned long-term development (locked policy, transparent reporting) |

**Design principle:** The exchange does not “print” PNP when users buy. Purchases draw from **sale inventory**. When inventory is exhausted, new primary supply waits for **vault release** or secondary market liquidity—not hidden minting.

### 2.3 Year vaults — 90% activity-based release

The remaining **9,000,000 PNP (90%)** sits in **nine annual vaults** of **1,000,000 PNP each**, starting **2026**.

```
Total 10M PNP
├── 1M genesis pools (10%) — structured launch liquidity
└── 9M year vaults (90%) — 1M per year × 9 years
         └── Released only via stake + platform activity
```

**Vault rules:**

- Each calendar year unlocks **one vault** (when its year arrives).
- Release flows into the **reward pool** for staking, missions, and qualified activity.
- **No post-genesis uncapped mint** — if vaults are empty, rewards pause until the next vault unlocks or activity rules recycle fees.

This creates **predictable, slow supply expansion** tied to **real usage**, not hype cycles.

### 2.4 Supply reduction — burns

A portion of PNP paid as **fees** (trading, sell-side, game rake, etc.) is **burned**—permanently removed from circulating supply. Over time, active platform use can make PNP **more scarce**, not more diluted.

---

## 3. Utility — why people use and hold PNP

### 3.1 Exchange & trading

PNP is integrated into the live PointPay exchange:

- **Buy / sell PNP** on Hub and PNP/USDT spot
- **Pay fees in PNP** — members receive a **fee discount** when settling trading costs in PNP instead of USDT
- **PNP/USDT pair** — transparent on-platform liquidity

**Demand driver:** Active traders hold PNP to **reduce cost of trading**—a direct, measurable benefit.

### 3.2 Staking

Users can **lock PNP on Hub** and earn rewards dripped from **year-vault emission**, not from unlimited minting.

- Rewards scale with vault availability and platform health
- Staking aligns long-term holders with ecosystem growth
- Early stakers benefit from vault releases as activity grows

**Demand driver:** Holders who believe in PointPay’s growth stake PNP for **yield sourced from capped vaults**, not inflationary printing.

### 3.3 Missions & onboarding

New and active users complete **missions** (welcome pack, first deposit, first trade, first stake) and receive small PNP rewards from the **marketing pool**.

**Demand driver:** Missions convert **real activation** into PNP distribution—users experience utility before holding larger balances.

### 3.4 Referral & community growth

A **give-first referral program** rewards both invitee and sponsor with PNP from the marketing pool when new members activate—one level, transparent caps.

**Demand driver:** Community members promote PointPay because **growth is rewarded in the same coin** they use on-platform.

### 3.5 Games — Crash & play ecosystem

PNP is a native rail on **PointPay Play** (e.g. Crash at [play.pointpay.exchange](https://play.pointpay.exchange)):

- Bet and settle in PNP
- Platform fees partially **burn** supply
- Games drive **transaction volume** and **recurring demand** for PNP balances

**Demand driver:** Entertainment + finance in one account increases **daily active use** of PNP, not passive hoarding.

### 3.6 Charity & social impact — PNP for Good · Circles (live)

**PNP for Good** is live on the Hub at `/pnp/good`. It is a **peer Circles** product — retention, fee sink, and brand impact — not an investment or guaranteed-return product.

**How a Give works (every donation `D`):**
- **5%** → **Good Treasury** (permanent charity pool; does not re-enter Circles gameplay)
- **8%** → donor **Thank-You** as **Circle Credit** (First Spark lifetime first Give: **12%**)
- **87%** → recipient Circle Credit (First Spark: **83%**)

**Instant Good Pack** (same second): Thank-You Credit + a **Claim Right** (notional Grow size = Circle multiple × `D`) + a short fee-boost window. Claim Rights are **filled by later peer Gives**, not by minting 2× from the vault.

**On each fill:** a Circle-defined free % (Seed ~12% → higher Circles up to ~20%, plus modest Flame/Pulse bonuses) unlocks to tradable PNP; the rest stays **Circle Credit** (pay trading fees + Give again; **no sell / stake / withdraw**).

**Circles:** Seed → Sprout → Grove → Canopy → Legacy (higher multiples and free % unlock by ladder health and activity gates). Living Match, Good Mirror, Pulse Hour, and Impact ticks keep Gives organic.

**Public note:** Good Treasury totals and a product summary are published via `GET /api/public/pnp/good` and the Hub Circles page.

**Demand driver:** Purpose-linked activity keeps PNP in fee/Give float and strengthens brand trust beyond pure trading.

*Compliance:* PointPay does not describe Claim Rights as guaranteed profit, risk-free doubling, or timed cash payouts. Progress depends on community Gives.

### 3.7 Self-custody — BSC today, native chain tomorrow

| Rail | Wallet | Status |
|------|--------|--------|
| **PointPay Hub** | Login / venue balance | **Live** |
| **BSC BEP20** | MetaMask, Trust Wallet | **Live** — verified contract |
| **PointPay Chain** | Keplr, Leap (`pnp1…`) | **Testnet soak → mainnet roadmap** |

Hub **withdraw to BSC** lets users hold PNP in their own wallet while staying inside the **global 10M cap**.

---

## 4. Demand & supply — how the ecosystem grows

### 4.1 Demand side (why buy pressure increases)

| Channel | Mechanism |
|---------|-----------|
| **Trading** | Fee discount → traders keep PNP float |
| **Staking** | Lock supply → less free float on market |
| **Games** | Players maintain PNP balance for Crash & future titles |
| **Missions / referrals** | New users enter ecosystem and retain PNP |
| **Brand & listings** | BscScan verification, logo, DEX liquidity (optional) |
| **Chain narrative** | Early adopters before mainnet self-custody |
| **PNP for Good** | Circles Gives → Good Treasury + Circle Credit fee sink |

### 4.2 Supply side (why inflation stays controlled)

| Control | Effect |
|---------|--------|
| **10M hard cap** | Absolute ceiling — no surprise mint |
| **90% in vaults** | Supply enters slowly, year by year |
| **Sale pool only for primary buy** | No “infinite shop” |
| **Burn on fees** | Circulating supply can shrink with activity |
| **Global accounting** | Hub + BSC + chain share one ledger concept |

### 4.3 Flywheel

```
More users → more trades & games → more fee burns + vault activity
     ↑                                        ↓
Stake & hold ← utility (discounts, rewards) ← PNP demand
```

This is a **product flywheel**, not a promise of price. Value follows **usage, scarcity, and trust**.

---

## 5. Brand, logo & trust

### 5.1 Why the PNP identity matters

In crypto, **visual trust is infrastructure**. Unverified tokens show gray icons and zero metadata—users cannot distinguish product coins from daily scam deployments.

PointPay’s PNP brand includes:

- **Verified source code** on BscScan
- **Official logo** (SVG/PNG) on explorer and Hub
- **Single official contract** published on [pointpay.exchange/pnp](https://pointpay.exchange/pnp)
- **Public supply API** for auditors and users

### 5.2 How the logo protects the community

| Without official branding | With official PNP branding |
|---------------------------|----------------------------|
| Wallets show generic gray icon | Recognizable PointPay mark |
| Users paste wrong contract addresses | One published address on Hub |
| Copycat tokens confuse newcomers | BscScan + site + GitHub alignment |
| Support cannot verify “real PNP” | Clear “official vs fake” guidance |

**The logo is not decoration—it is a safety signal** that tells users: *this contract belongs to the exchange you already use.*

### 5.3 Security & honesty policy

PointPay commits to:

- **No hidden mint** after genesis / vault rules
- **No fake “mainnet” labels** before validator ceremony
- **Separate chain infra** from exchange server (consensus not on trade box)
- **Published roadmap** — [ROADMAP.md](./ROADMAP.md), [SECURITY.md](./SECURITY.md)
- **Open source** — [github.com/pointpay-hub/pointpay-chain](https://github.com/pointpay-hub/pointpay-chain)

We do not use “guaranteed profit,” “hack-proof,” or anonymous team hype.

---

## 6. Technology roadmap

### Phase 1 — Product coin (complete)

- [x] PNP Hub — buy, sell, stake, missions, fee-in-PNP
- [x] Global 10M cap accounting
- [x] Crash / Play PNP rail
- [x] BSC BEP20 deploy + Hub withdraw
- [x] BscScan contract verification
- [x] Public supply API & official Hub page

### Phase 2 — Credibility & liquidity (2026)

- [ ] BscScan token info + logo approval
- [ ] Trust Wallet assets listing
- [ ] Optional DEX liquidity (e.g. PancakeSwap PNP pair)
- [x] PNP for Good · Circles (Seed–Grove live; public Good note)
- [ ] Expanded missions & game titles

### Phase 3 — PointPay Chain testnet (in progress)

- [x] Dedicated chain host (consensus off exchange server)
- [x] Public testnet RPC, API, explorer
- [x] Cosmos SDK + CometBFT `pointpayd` binary (OSS)
- [ ] External full-node operators
- [ ] Months of soak testing & upgrade drills

### Phase 4 — Mainnet readiness

- [ ] Security audit sign-off
- [ ] Multi-validator genesis ceremony (≥10 independent validators)
- [ ] Mainnet `pointpay-1` launch
- [ ] Public mainnet explorer (`explorer.pointpay.exchange`)
- [ ] Native `pnp1…` self-custody withdraw from Hub

### Phase 5 — Interoperability

- [ ] Audited bridge Hub ↔ PointPay Chain (multisig + caps)
- [ ] IBC connections to Cosmos ecosystem
- [ ] Additional EVM wraps (same global cap rules)
- [ ] DEX & aggregator listings for native + wrapped PNP

*Mainnet and bridge phases are **growth-gated**—we will not rush a chain label before security milestones are met.*

---

## 7. Community & global impact

### 7.1 Community-first distribution

Most PNP **never sits in a single wallet at launch**. It is spread across:

- Users (sale + rewards)
- Stakers (vault emission)
- Marketing (missions, referrals)
- Long-term vaults (future years)

This reduces **whale-dump risk** from a one-day mega-mint and ties distribution to **participation**.

### 7.2 Education & safety

PointPay will publish:

- How to add **official PNP** in MetaMask (BSC)
- How to spot **fake contracts**
- Hub vs self-custody explained plainly
- Testnet vs mainnet status (no misleading labels)

### 7.3 A safer future for users worldwide

By combining **capped supply**, **verified contracts**, **exchange utility**, and ** eventual decentralized chain validation**, PNP aims to offer emerging-market users a **credible on-ramp coin**—one they can **use, stake, play, and eventually self-custody** without navigating thousands of unverified BSC tokens.

We view financial safety as **clarity + limits + product**, not slogans.

---

## 8. Risks & disclaimers

**Please read carefully.**

- **PNP is not legal tender** and does not represent equity in PointPay.
- **Cryptocurrency is volatile.** Past platform activity does not guarantee future price or reward rates.
- **Hub balances are custodial** until withdrawn to self-custody; users accept venue terms.
- **Smart contract & bridge risk** applies to BSC and future chain rails.
- **Regulatory treatment** may vary by country; users are responsible for compliance.
- **Roadmap items** are targets, not promises; dates may shift for security reasons.
- **No investment advice** — this document describes design intent, not a solicitation.

---

## 9. Summary

| Property | Value |
|----------|-------|
| **Name** | PointPay |
| **Symbol** | PNP |
| **Max supply** | 10,000,000 (global) |
| **Genesis liquid** | 1,000,000 (10%) |
| **Vault schedule** | 9 × 1,000,000 PNP (2026–2034) |
| **Primary utility** | Exchange fees, stake, games, missions |
| **BSC contract** | `0x6b778d717b3618ddc23d18b7f31134cf01af2342` |
| **Hub** | [pointpay.exchange/pnp](https://pointpay.exchange/pnp) |
| **Docs / code** | [github.com/pointpay-hub/pointpay-chain](https://github.com/pointpay-hub/pointpay-chain) |

**PNP is PointPay’s native coin—capped, useful, and built for the long term.**  
We release supply through **activity**, burn through **use**, and earn trust through **transparency**.

---

## 10. Contact & resources

| Resource | Link |
|----------|------|
| Official Hub | https://pointpay.exchange/pnp |
| **Whitepaper (PDF)** | https://pointpay.exchange/pointpay-pnp-whitepaper.pdf |
| Whitepaper (web) | https://pointpay.exchange/pnp-whitepaper.html |
| Exchange | https://pointpay.exchange |
| Play / Crash | https://play.pointpay.exchange |
| GitHub (chain) | https://github.com/pointpay-hub/pointpay-chain |
| Explorer (testnet) | https://testnet-explorer.pointpay.exchange |
| Support | support@pointpay.exchange |
| BscScan token | https://bscscan.com/token/0x6b778d717b3618ddc23d18b7f31134cf01af2342 |

---

*© 2026 PointPay. Licensed documentation may be shared with attribution. On-chain parameters govern in case of conflict with this document.*
