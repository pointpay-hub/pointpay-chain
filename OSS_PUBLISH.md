# Publish PointPay Chain as OSS (Phase D)

Repo is currently **not** a git root on the Windows workspace. Do this once you have a GitHub org/user:

## 1. Create empty public repos (org: `pointpay-hub`)

| Repo | Purpose |
|------|---------|
| **`pointpay-chain`** | Binary + protocol docs (required) |
| **`pnpscan`** | Explorer static UI only |

Description for chain: `PointPay Chain — Cosmos SDK app (native PNP / upnp). Not a BEP20 token.`

Push helper (after repos exist):

```bash
# set a PAT with repo scope (do not commit the token)
set GITHUB_TOKEN=ghp_...
node _deploy/prepare-oss-publish.mjs
node _deploy/push-oss-github.mjs
# or explorer only:
node _deploy/push-oss-github.mjs --only=pnpscan
```

## 2. Publish only the chain tree (recommended)

Keep exchange (`backend/`, `frontend/`, `_deploy/`) private. Publish:

```
chain/pointpay/     # binary source + LICENSE
chain/ROADMAP.md
chain/SECURITY.md
chain/INFRA.md
chain/genesis/
chain/x/pnp/SPEC.md
chain/explorer/     # Ping.pub config stubs
chain/docker-compose.yml
.github/workflows/pointpayd-build.yml  # if moved under chain repo
```

Example:

```bash
# on a clean machine / WSL
mkdir pointpay-chain && cd pointpay-chain
git init
# copy the paths above
git add .
git commit -m "Initial public pointpayd source (Apache-2.0)"
git branch -M main
git remote add origin git@github.com:YOUR_ORG/pointpay-chain.git
git push -u origin main
```

## 3. Never publish

- `_deploy/server.config.json`, passwords, SSH keys
- `backend/.env`, HD mnemonics, JWT secrets
- Validator keyrings under `/var/www/pointpay-chain/data`

## 4. After push

- [ ] Enable GitHub Actions build workflow
- [ ] Tag `v0.1.0-private-dev` with genesis SHA from [`genesis/CHECKSUMS.md`](./genesis/CHECKSUMS.md)
- [ ] Link from Hub / ROADMAP

**Blocked locally until:** `git init` + `gh`/remote credentials on this machine (or push from CI/Linux).
