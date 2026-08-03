import { Client } from "ssh2";

const PASS = process.env.ANONVM_SSH_PASSWORD;
if (!PASS) {
  console.error("Set ANONVM_SSH_PASSWORD");
  process.exit(1);
}

function run(conn, cmd) {
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

const conn = await new Promise((resolve, reject) => {
  const c = new Client();
  c.on("ready", () => resolve(c)).on("error", reject).connect({
    host: "31.59.151.61",
    port: 22,
    username: "root",
    password: PASS,
    readyTimeout: 15000,
  });
});

console.log("SSH: CONNECTED OK");
const r = await run(
  conn,
  `echo "=== uptime ==="; uptime
echo "=== pointpayd ==="; ls -la /usr/local/bin/pointpayd 2>&1 || true
echo "=== upload tmp ==="; ls -lh /tmp/pointpayd.b64 2>&1 || true
echo "=== sentry service ==="; systemctl is-active pointpay-sentry 2>&1 || true
echo "=== listening 26656 ==="; ss -tlnp | grep 26656 || true`
);
console.log(r.out.trim());
conn.end();
