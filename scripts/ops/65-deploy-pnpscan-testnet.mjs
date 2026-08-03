/**
 * Deploy PNPScan static UI to chain testnet (176.123.2.230).
 * Auth: CHAIN_SSH_PASSWORD or BOTZY_SSH_PASSWORD, or SSH key.
 *
 * Usage:
 *   node scripts/ops/65-deploy-pnpscan-testnet.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import {
  connectChain,
  loadChainConfig,
  putDir,
  resolveExplorerDir,
  run,
} from "./chain-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PUBLIC = path.join(ROOT, "explorer", "public");

const cfg = loadChainConfig();
console.log(`PNPScan deploy → ${cfg.host}:${cfg.port ?? 2222}`);

const conn = await connectChain(cfg);

const remoteDir = await resolveExplorerDir(conn, cfg);
console.log(`Explorer root: ${remoteDir}`);

await run(conn, `mkdir -p ${remoteDir}`);
console.log("Uploading explorer/public/* …");
await putDir(conn, PUBLIC, remoteDir);

const ls = await run(conn, `ls -la ${remoteDir}`);
console.log(ls.out.trim());

const verify = await run(
  conn,
  `grep -l 'mega-menu' ${remoteDir}/index.html && grep -l 'val-table' ${remoteDir}/index.html && grep -l 'PnpTools' ${remoteDir}/tools.js && echo DEPLOY_OK`
);
if (!verify.out.includes("DEPLOY_OK")) {
  console.error("Deploy verification failed — mega-menu or tools.js missing on server.");
  process.exit(1);
}

console.log("\n✓ PNPScan deployed.");
console.log("  https://testnet-explorer.pointpay.exchange/");
console.log("  Hard refresh: Ctrl+Shift+R");

conn.end();
