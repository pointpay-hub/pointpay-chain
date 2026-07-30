#!/usr/bin/env python3
"""
Patch genesis for PointPay economy (chain/genesis/economy.json).

- Fund module accounts with full 10M PNP (upnp base units)
- Zero mint inflation (no uncapped stake inflation theater for PNP)
- Set pnp.params.maxSupply as string (protojson uint64)
- Optional: fund validator/alice with DEMO_UPNP for private-dev gas + explorer txs

Usage:
  python3 scripts/patch_genesis_economy.py /path/to/genesis.json
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

MAX_UPNP = 10_000_000 * 1_000_000  # 10M PNP × 6 decimals
# display PNP → upnp
POOLS = {
    "pnp_sale": 600_000 * 1_000_000,
    "pnp_marketing": 200_000 * 1_000_000,
    "pnp_creator": 100_000 * 1_000_000,
    "pnp_founder": 100_000 * 1_000_000,
}
for year in range(2026, 2035):
    POOLS[f"pnp_vault_{year}"] = 1_000_000 * 1_000_000

# Private-dev faucet on the gentx validator account (taken from sale)
DEMO_UPNP = int(os.environ.get("DEMO_UPNP", str(1_000 * 1_000_000)))  # 1000 PNP


def load_pool_addrs(root: Path) -> dict[str, str]:
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
            missing = [n for n in POOLS if n not in addrs]
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
    missing = [n for n in POOLS if n not in addrs]
    if missing:
        raise SystemExit(f"missing module addresses: {missing}\n{out}")
    return addrs


def patch(genesis_path: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    addrs = load_pool_addrs(root)

    g = json.loads(genesis_path.read_text())
    app = g.setdefault("app_state", {})

    # --- mint: zero inflation (bond denom stays stake; never mint upnp) ---
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
    app["pnp"]["params"] = {"maxSupply": str(MAX_UPNP)}

    # --- bank balances: keep non-upnp (stake), add pools ---
    pool_amounts = dict(POOLS)
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
    if totals.get("upnp") != MAX_UPNP:
        raise SystemExit(f"upnp supply {totals.get('upnp')} != max {MAX_UPNP}")

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
        f"Patched {genesis_path}: upnp={MAX_UPNP} pools={len(POOLS)} "
        f"demo_upnp={DEMO_UPNP} alice={alice_addr}"
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: patch_genesis_economy.py <genesis.json>", file=sys.stderr)
        sys.exit(2)
    patch(Path(sys.argv[1]))
