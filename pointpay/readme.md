# pointpay — Cosmos app binary (Ignite scaffold + PointPay hardening)

**License:** [Apache-2.0](./LICENSE) · **Build:** [BUILD.md](./BUILD.md)  
**Parent roadmap:** [../ROADMAP.md](../ROADMAP.md) · [../SECURITY.md](../SECURITY.md) · [../INFRA.md](../INFRA.md)

This tree is the maintained `pointpayd` source. Build on **dedicated CI/hosts**, not as production consensus on the exchange VPS.

```bash
make install          # needs Go 1.26+ (see go.mod); uses -checklinkname=0
# or
docker build -t pointpayd:local .
```

Faucet is disabled in `config.yml`. Phase C: zero inflation / full 10M genesis — see ROADMAP.  
Venue explorer (private-dev): `/explorer` (PNPScan) via `PNP_CHAIN_RPC`.
