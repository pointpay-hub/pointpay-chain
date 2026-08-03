/**
 * Bootstrap anonvm sentry — download pointpayd from .230 via SFTP, upload, run setup.
 * $env:ANONVM_SSH_PASSWORD='…'
 * $env:CHAIN_FORCE_PASSWORD='1'; $env:CHAIN_SSH_PASSWORD='…'
 */
import { Client } from "ssh2";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { connectChain, run as chainRun } from "./chain-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SENTRY = { host: "31.59.151.61", port: 22, username: "root" };
const PASS = process.env.ANONVM_SSH_PASSWORD;
const CHAIN_BIN = "/var/www/pointpay-chain/bin/pointpayd";
const LOCAL_BIN = path.join(__dirname, "pointpayd.bin");
const SCRIPT = fs.readFileSync(path.join(ROOT, "scripts/bootstrap-sentry-ubuntu.sh"), "utf8");

if (!PASS) {
  console.error("Set ANONVM_SSH_PASSWORD");
  process.exit(1);
}

function connectSentry() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => resolve(conn))
      .on("error", reject)
      .connect({ ...SENTRY, password: PASS, readyTimeout: 30000 });
  });
}

function run(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream
        .on("close", (code) => resolve({ code, out }))
        .on("data", (d) => {
          out += d.toString();
          process.stdout.write(d);
        })
        .stderr.on("data", (d) => {
          out += d.toString();
          process.stderr.write(d);
        });
    });
  });
}

function sftpGet(conn, remote, local) {
  return new Promise((res, rej) => {
    conn.sftp((e, sftp) => {
      if (e) return rej(e);
      sftp.fastGet(remote, local, (err) => (err ? rej(err) : res()));
    });
  });
}

function sftpPut(conn, local, remote) {
  return new Promise((res, rej) => {
    conn.sftp((e, sftp) => {
      if (e) return rej(e);
      sftp.fastPut(local, remote, (err) => (err ? rej(err) : res()));
    });
  });
}

console.log("1/5 Fetch pointpayd from chain testnet (.230)…");
process.env.CHAIN_FORCE_PASSWORD = "1";
const cc = await connectChain();
const probe = await chainRun(cc, `test -f ${CHAIN_BIN} && ls -lh ${CHAIN_BIN}`);
console.log(probe.out.trim());
await sftpGet(cc, CHAIN_BIN, LOCAL_BIN);
cc.end();
const size = fs.statSync(LOCAL_BIN).size;
console.log(`Downloaded ${(size / 1e6).toFixed(1)} MB locally`);
if (size < 1_000_000) {
  console.error("Binary too small — abort");
  process.exit(1);
}

console.log("2/5 Connect anonvm + upload binary…");
const conn = await connectSentry();
await sftpPut(conn, LOCAL_BIN, "/usr/local/bin/pointpayd");
await run(conn, "chmod +x /usr/local/bin/pointpayd && /usr/local/bin/pointpayd version");

console.log("3/5 Install SSH public key…");
const pubPath = path.join(os.homedir(), ".ssh", "id_ed25519_sentry.pub");
if (fs.existsSync(pubPath)) {
  const pub = fs.readFileSync(pubPath, "utf8").trim().replace(/'/g, "'\\''");
  await run(
    conn,
    `mkdir -p /root/.ssh && chmod 700 /root/.ssh && touch /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && grep -qF '${pub.split(" ")[1]}' /root/.ssh/authorized_keys || echo '${pub}' >> /root/.ssh/authorized_keys`
  );
}

console.log("4/5 Upload bootstrap script…");
const localSh = path.join(__dirname, "bootstrap-sentry-ubuntu.sh");
fs.writeFileSync(localSh, SCRIPT.replace(/\r/g, ""));
await sftpPut(conn, localSh, "/root/bootstrap-sentry-ubuntu.sh");

console.log("5/5 Run bootstrap…");
const result = await run(conn, "sed -i 's/\\r$//' /root/bootstrap-sentry-ubuntu.sh && bash /root/bootstrap-sentry-ubuntu.sh");

console.log("\n=== Verify ===");
await run(
  conn,
  `systemctl is-active pointpay-sentry; ss -tlnp | grep 26656 || true; curl -s http://127.0.0.1:26657/status | jq -r '.result.sync_info | "height=\\(.latest_block_height) catching_up=\\(.catching_up)"' || true`
);

conn.end();
try {
  fs.unlinkSync(LOCAL_BIN);
} catch {
  /* ok */
}
process.exit(result.code === 0 ? 0 : 1);
