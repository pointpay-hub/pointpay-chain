# x/pnp module — design (implement after Ignite scaffold)

## Purpose

On-chain economy for native PNP under [SECURITY.md](../../SECURITY.md).

## Params

- `max_supply` (uint) — `10_000_000 * 1e6` upnp; immutable after genesis (governance may not raise it).

## State

- `sale_remaining`, `marketing_remaining`, `creator_remaining`, `founder_remaining`
- `vaults[]` — year, remaining, unlocked
- `burned_total`
- **No** `MsgAdminMint`. **No** `MsgFreeze`.

## Msgs (allowed)

- `MsgAllocateFromSale` — authority = module account / vesting only; decreases sale_remaining; bank send from module account (pre-funded at genesis).
- `MsgReleaseVault` — only if year unlocked by time rule; moves vault → reward pool module account.
- `MsgBurn` — anyone burns own coins.

## Genesis

**Best path:** mint **all 10M** once at `InitGenesis` into module accounts (sale, marketing, creator, founder, vault_2026…vault_2034). Circulating = what left those accounts. **No mint message exists in the binary after genesis.**

Fund from `genesis/economy.json`. See [ROADMAP.md](../../ROADMAP.md) Phase C.

## Invariant tests

- `TotalSupply ≤ MaxSupply` always (equality at genesis after full mint).
- Sum(module locks) + liquid = TotalSupply.
- No keeper method increases supply after `InitGenesis`.
