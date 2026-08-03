import { Client } from "ssh2";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const DEFAULT_CHAIN = {
  host: "176.123.2.230",
  port: 2222,
  username: "root",
  explorerDir: "/var/www/pointpay-explorer",
  appDir: "/var/www/pointpay-chain",
};

function expandHome(p) {
  if (!p) return p;
  return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;
}

function defaultKeyPath() {
  for (const name of ["id_ed25519", "id_rsa"]) {
    const p = path.join(os.homedir(), ".ssh", name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function loadChainConfig() {
  const configPath =
    process.env.POINTPAY_CHAIN_CONFIG ||
    path.join(ROOT, "chain-server.config.json");
  let cfg = { ...DEFAULT_CHAIN };
  if (fs.existsSync(configPath)) {
    cfg = { ...cfg, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
  }
  return cfg;
}

function authOptions(cfg) {
  const password =
    cfg.password ||
    process.env.CHAIN_SSH_PASSWORD ||
    process.env.BOTZY_SSH_PASSWORD ||
    process.env.POINTPAY_SSH_PASSWORD;
  const forcePassword = process.env.CHAIN_FORCE_PASSWORD === "1" || process.env.CHAIN_FORCE_PASSWORD === "true";

  if (password && forcePassword) return { password };

  const keyPath = expandHome(cfg.privateKeyPath || process.env.CHAIN_SSH_KEY) || defaultKeyPath();
  if (keyPath && fs.existsSync(keyPath) && !forcePassword) {
    const opt = { privateKey: fs.readFileSync(keyPath) };
    const passphrase = cfg.passphrase || process.env.CHAIN_SSH_KEY_PASSPHRASE;
    if (passphrase) opt.passphrase = passphrase;
    if (password) {
      return { privateKey: opt.privateKey, passphrase: opt.passphrase, password };
    }
    return opt;
  }
  if (password) return { password };
  return null;
}

export function connectChain(cfg = loadChainConfig()) {
  const auth = authOptions(cfg);
  if (!auth) {
    return Promise.reject(
      new Error(
        "Chain SSH auth missing. Set CHAIN_SSH_PASSWORD or BOTZY_SSH_PASSWORD (176.123.2.230:2222)."
      )
    );
  }
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => resolve(conn))
      .on("error", reject)
      .connect({
        host: cfg.host,
        port: cfg.port ?? 2222,
        username: cfg.username ?? "root",
        ...auth,
        readyTimeout: 30000,
      });
  });
}

export function run(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream
        .on("close", (code) => resolve({ code, out }))
        .on("data", (d) => (out += d.toString()))
        .stderr.on("data", (d) => (out += d.toString()));
    });
  });
}

export function put(conn, local, remote) {
  return new Promise((res, rej) =>
    conn.sftp((e, s) => (e ? rej(e) : s.fastPut(local, remote, (x) => (x ? rej(x) : res()))))
  );
}

export function putDir(conn, localDir, remoteDir) {
  const files = fs.readdirSync(localDir).filter((f) => fs.statSync(path.join(localDir, f)).isFile());
  return Promise.all(
    files.map((f) => put(conn, path.join(localDir, f), `${remoteDir}/${f}`.replace(/\/+/g, "/")))
  );
}

export async function resolveExplorerDir(conn, cfg) {
  if (cfg.explorerDir) return cfg.explorerDir;
  const guess = await run(
    conn,
    `nginx -T 2>/dev/null | awk '/server_name.*testnet-explorer/{f=1} f&&/root /{print $2; exit}' | tr -d ';'`
  );
  const dir = guess.out.trim();
  if (dir && dir.startsWith("/")) return dir;
  return DEFAULT_CHAIN.explorerDir;
}
