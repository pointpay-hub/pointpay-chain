#!/usr/bin/env python3
"""
Patch genesis for PointPay economy (chain/genesis/economy.json).

- Fund module accounts with full maxSupply PNP (upnp base units) from economy.json
- Zero mint inflation (no uncapped stake inflation theater for PNP)
- Set pnp.params.maxSupply as string (protojson uint64)
- Optional: fund validator/alice with DEMO_UPNP for private-dev gas + explorer txs

Usage:
  python3 scripts/patch_genesis_economy.py /path/to/genesis.json

Ceremony (mainnet):
  DEMO_UPNP=0 python3 scripts/patch_genesis_economy.py genesis.json
  Never set mint_denom=upnp via gov after genesis (this patch sets mint_denom=stake).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path


def _find_economy_json() -> Path:
    pref = os.environ.get("ECONOMY_JSON", "").strip()
    if pref:
        p = Path(pref)
        if not p.is_file():
            raise SystemExit(f"ECONOMY_JSON not found: {p}")
        return p
    here = Path(__file__).resolve()
    # monorepo: chain/pointpay/scripts → chain/genesis/economy.json
    # OSS:     pointpay/scripts → ../genesis/economy.json
    candidates = [
        here.parents[2] / "genesis" / "economy.json",
        here.parents[1].parent / "genesis" / "economy.json",
        Path.cwd() / "genesis" / "economy.json",
        Path.cwd() / "economy.json",
    ]
    for p in candidates:
        if p.is_file():
            return p
    raise SystemExit(
        "economy.json not found; set ECONOMY_JSON=/path/to/economy.json "
        f"(searched: {', '.join(str(c) for c in candidates)})"
    )


def load_economy() -> tuple[int, dict[str, int]]:
    """Return (max_upnp, pools name→upnp) from economy.json — single source of truth."""
    path = _find_economy_json()
    eco = json.loads(path.read_text())
    decimals = int(eco.get("decimals", 6))
    scale = 10**decimals
    max_pnp = int(eco["maxSupplyPnp"])
    max_upnp = max_pnp * scale

    pools: dict[str, int] = {}
    name_map = {
        "sale": "pnp_sale",
        "marketing": "pnp_marketing",
        "creator": "pnp_creator",
        "founder": "pnp_founder",
    }
    for key, mod in name_map.items():
        if key not in eco["pools"]:
            raise SystemExit(f"economy.json pools missing '{key}'")
        pools[mod] = int(eco["pools"][key]) * scale

    vaults = eco["vaults"]
    count = int(vaults["count"])
    each = int(vaults["eachPnp"]) * scale
    first = int(vaults["firstYear"])
    for i in range(count):
        pools[f"pnp_vault_{first + i}"] = each

    pool_sum = sum(pools.values())
    if pool_sum != max_upnp:
        raise SystemExit(
            f"economy.json pool+vault sum {pool_sum} != maxSupply {max_upnp} ({path})"
        )
    print(f"Loaded economy from {path}: max_upnp={max_upnp} pools={len(pools)}")
    return max_upnp, pools


# Private-dev faucet on the gentx validator account (taken from sale).
# Mainnet ceremony MUST set DEMO_UPNP=0.
DEMO_UPNP = int(os.environ.get("DEMO_UPNP", str(1_000 * 1_000_000)))  # 1000 PNP


def load_pool_addrs(root: Path, pool_names: list[str]) -> dict[str, str]:
    # Prefer precomputed file (dedicated hosts may lack Go toolchain).
    pref = os.environ.get("POOL_ADDRS_FILE", "").strip()
    candidates = []
    if pref:
        candidates.append(Path(pref))
    candidates.append(root / "scripts" / "pool_addrs.txt")
    candidates.append(Path(__file__).resolve().parent / "pool_addrs.txt")
    for p in candidates:
        if p.is_file():
            addrs: dict[str, str] = {}
            for line in p.read_text().splitlines():
                parts = line.split()
                if len(parts) >= 2 and not parts[0].startswith("#"):
                    addrs[parts[0]] = parts[1]
            missing = [n for n in pool_names if n not in addrs]
            if missing:
                raise SystemExit(f"missing module addresses in {p}: {missing}")
            print(f"Loaded pool addrs from {p}")
            return addrs

    env = {**os.environ, "GOTOOLCHAIN": "local"}
    out = subprocess.check_output(
        ["go", "run", "-ldflags=-checklinkname=0", "./scripts/print_pool_addrs"],
        cwd=str(root),
        text=True,
        env=env,
    )
    addrs = {}
    for line in out.strip().splitlines():
        parts = line.split()
        if len(parts) >= 2:
            addrs[parts[0]] = parts[1]
    missing = [n for n in pool_names if n not in addrs]
    if missing:
        raise SystemExit(f"missing module addresses: {missing}\n{out}")
    return addrs


def patch(genesis_path: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    max_upnp, pools = load_economy()
    addrs = load_pool_addrs(root, list(pools.keys()))

    g = json.loads(genesis_path.read_text())
    app = g.setdefault("app_state", {})

    # --- mint: zero inflation (bond denom stays stake; never mint upnp) ---
    # W1: app does not hardcode this — ceremony MUST run this patch.
    # After genesis, gov must NEVER set mint_denom=upnp.
    mint = app.setdefault("mint", {})
    params = mint.setdefault("params", {})
    params["mint_denom"] = "stake"
    params["inflation_rate_change"] = "0.000000000000000000"
    params["inflation_max"] = "0.000000000000000000"
    params["inflation_min"] = "0.000000000000000000"
    minter = mint.setdefault("minter", {})
    minter["inflation"] = "0.000000000000000000"
    minter["annual_provisions"] = "0.000000000000000000"

    # --- pnp max supply (string for protojson) ---
    app.setdefault("pnp", {})
    app["pnp"]["params"] = {"maxSupply": str(max_upnp)}

    # --- bank balances: keep non-upnp (stake), add pools ---
    pool_amounts = dict(pools)
    if DEMO_UPNP > 0:
        if pool_amounts["pnp_sale"] < DEMO_UPNP:
            raise SystemExit("DEMO_UPNP exceeds sale pool")
        pool_amounts["pnp_sale"] -= DEMO_UPNP

    new_balances = []
    alice_addr = None
    for b in app.get("bank", {}).get("balances", []):
        coins = [c for c in b.get("coins", []) if c.get("denom") != "upnp"]
        if coins:
            new_balances.append({"address": b["address"], "coins": coins})
            # first stake-funded account = gentx validator (alice)
            if alice_addr is None and any(c.get("denom") == "stake" for c in coins):
                alice_addr = b["address"]

    for name, amount in pool_amounts.items():
        new_balances.append(
            {
                "address": addrs[name],
                "coins": [{"denom": "upnp", "amount": str(amount)}],
            }
        )

    if DEMO_UPNP > 0:
        if not alice_addr:
            raise SystemExit("no alice/stake account found for DEMO_UPNP")
        # merge into existing alice balance row
        merged = False
        for b in new_balances:
            if b["address"] == alice_addr:
                b["coins"].append({"denom": "upnp", "amount": str(DEMO_UPNP)})
                merged = True
                break
        if not merged:
            new_balances.append(
                {"address": alice_addr, "coins": [{"denom": "upnp", "amount": str(DEMO_UPNP)}]}
            )

    totals: dict[str, int] = {}
    for b in new_balances:
        for c in b["coins"]:
            totals[c["denom"]] = totals.get(c["denom"], 0) + int(c["amount"])
    supply = [{"denom": d, "amount": str(a)} for d, a in sorted(totals.items())]
    if totals.get("upnp") != max_upnp:
        raise SystemExit(f"upnp supply {totals.get('upnp')} != max {max_upnp}")

    bank = app.setdefault("bank", {})
    bank["balances"] = new_balances
    bank["supply"] = supply
    # denom metadata for LCD explorers
    meta = bank.setdefault("denom_metadata", [])
    if not any(m.get("base") == "upnp" for m in meta):
        meta.append(
            {
                "description": "PointPay native coin",
                "denom_units": [
                    {"denom": "upnp", "exponent": 0, "aliases": []},
                    {"denom": "pnp", "exponent": 6, "aliases": ["PNP"]},
                ],
                "base": "upnp",
                "display": "pnp",
                "name": "PointPay",
                "symbol": "PNP",
            }
        )

    genesis_path.write_text(json.dumps(g, indent=2) + "\n")
    print(
        f"Patched {genesis_path}: upnp={max_upnp} pools={len(pools)} "
        f"demo_upnp={DEMO_UPNP} alice={alice_addr}"
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: patch_genesis_economy.py <genesis.json>", file=sys.stderr)
        sys.exit(2)
    patch(Path(sys.argv[1]))
