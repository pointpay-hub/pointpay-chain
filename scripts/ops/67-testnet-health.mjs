/**
 * Testnet health report: public RPC + validator (.230) + sentry (anonvm).
 *
 * Env:
 *   CHAIN_SSH_PASSWORD | BOTZY_SSH_PASSWORD + CHAIN_FORCE_PASSWORD=1  — validator SSH
 *   ANONVM_SSH_PASSWORD — optional sentry SSH (skip if unset)
 */
import { Client } from "ssh2";
import { connectChain, loadChainConfig, run } from "./chain-lib.mjs";

const PUBLIC_RPC = "https://rpc-testnet.pointpay.exchange/status";
const PEERS_URL = "https://testnet-explorer.pointpay.exchange/peers.json";
const SENTRY = { host: "31.59.151.61", port: 22, username: "root" };

async function fetchJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

function syncLine(label, data) {
  const s = data?.result?.sync_info ?? data?.sync_info ?? {};
  const n = data?.result?.node_info ?? data?.node_info ?? {};
  return {
    label,
    height: s.latest_block_height ?? "?",
    catching_up: s.catching_up,
    moniker: n.moniker ?? "",
    id: n.id ?? "",
  };
}

async function sshStatus(host, port, user, password, label) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn
      .on("ready", async () => {
        try {
          const { out } = await run(
            conn,
            `curl -fsS http://127.0.0.1:26657/status 2>/dev/null || echo '{}'`
          );
          conn.end();
          let j = {};
          try {
            j = JSON.parse(out.trim());
          } catch {
            /* empty */
          }
          resolve(syncLine(label, j));
        } catch (e) {
          conn.end();
          resolve({ label, error: String(e.message || e) });
        }
      })
      .on("error", (e) => resolve({ label, error: e.message }))
      .connect({ host, port, username: user, password, readyTimeout: 15000 });
  });
}

console.log("=== PointPay testnet health ===\n");

let publicStatus;
try {
  publicStatus = await fetchJson(PUBLIC_RPC);
  const p = syncLine("public-rpc", publicStatus);
  console.log(`Public RPC: height=${p.height} catching_up=${p.catching_up} moniker=${p.moniker}`);
} catch (e) {
  console.log(`Public RPC: FAIL — ${e.message}`);
}

try {
  const peers = await fetchJson(PEERS_URL);
  console.log(`\npeers.json:`);
  console.log(`  seed: ${peers.seed}`);
  console.log(`  peers (${(peers.peers || []).length}): ${(peers.peers || []).join(", ") || "(none)"}`);
  console.log(`  updated: ${peers.updated_at || peers.updated || "?"}`);
} catch (e) {
  console.log(`\npeers.json: FAIL — ${e.message}`);
}

const cfg = loadChainConfig();
try {
  const conn = await connectChain(cfg);
  const { out: svc } = await run(conn, "systemctl is-active pointpayd 2>/dev/null || systemctl is-active pointpay 2>/dev/null || echo unknown");
  const v = syncLine("validator-230", JSON.parse((await run(conn, "curl -fsS http://127.0.0.1:26657/status")).out));
  conn.end();
  console.log(`\nValidator (.230): service=${svc.trim()} height=${v.height} catching_up=${v.catching_up}`);
} catch (e) {
  console.log(`\nValidator (.230): skip — ${e.message}`);
}

const sentryPass = process.env.ANONVM_SSH_PASSWORD;
if (sentryPass) {
  try {
    const s = await sshStatus(SENTRY.host, SENTRY.port, SENTRY.username, sentryPass, "sentry-anonvm");
    const conn = await new Promise((resolve, reject) => {
      const c = new Client();
      c.on("ready", () => resolve(c)).on("error", reject).connect({ ...SENTRY, password: sentryPass, readyTimeout: 15000 });
    });
    const svc = await run(conn, "systemctl is-active pointpay-sentry 2>/dev/null || echo inactive");
    conn.end();
    console.log(`\nSentry (anonvm): service=${svc.out.trim()} height=${s.height ?? "?"} catching_up=${s.catching_up ?? s.error}`);
  } catch (e) {
    console.log(`\nSentry (anonvm): skip — ${e.message}`);
  }
} else {
  console.log("\nSentry (anonvm): skip — set ANONVM_SSH_PASSWORD to probe");
}

if (publicStatus?.result?.sync_info) {
  const pubH = Number(publicStatus.result.sync_info.latest_block_height);
  console.log("\n--- summary ---");
  console.log(pubH > 0 ? `Network tip: block ${pubH}` : "Could not read network tip");
  console.log("Grow: https://testnet-explorer.pointpay.exchange/join.html");
}
