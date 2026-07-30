(() => {
  const RPC = "/rpc";
  const LCD = "/lcd";
  const LOOKBACK = 50;
  const SHOW = 8;

  const el = (id) => document.getElementById(id);
  const state = { blocks: [], txs: [], tip: 0, chainId: "pointpay-dedicated-1", loadedAt: 0 };

  function shortHash(h, head = 10, tail = 8) {
    if (!h || h.length < head + tail + 1) return h || "—";
    return `${h.slice(0, head)}…${h.slice(-tail)}`;
  }

  function ago(iso) {
    if (!iso) return "—";
    const ms = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(ms) || ms < 0) return new Date(iso).toLocaleString();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s} sec${s === 1 ? "" : "s"} ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h} hr${h === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleString();
  }

  function fmtPnp(amountBase) {
    const n = Number(amountBase || 0) / 1e6;
    if (!Number.isFinite(n)) return "—";
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} PNP`;
  }

  async function fetchJson(url, ms = 8000) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error(`${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function txHashFromB64(b64) {
    const buf = await crypto.subtle.digest("SHA-256", b64ToBytes(b64));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  async function loadFeed() {
    const status = await fetchJson(`${RPC}/status`);
    const sync = status.result?.sync_info || {};
    const tip = Number(sync.latest_block_height || 0);
    state.tip = tip;
    state.chainId = status.result?.node_info?.network || state.chainId;
    state.loadedAt = Date.now();

    el("statHeight").textContent = tip ? tip.toLocaleString() : "—";
    el("statTime").textContent = sync.latest_block_time ? ago(sync.latest_block_time) : "—";
    el("footChain").textContent = state.chainId;
    el("netBadge").textContent = "PNP Testnet";

    try {
      const sup = await fetchJson(`${LCD}/cosmos/bank/v1beta1/supply`);
      const upnp = (sup.supply || []).find((c) => c.denom === "upnp");
      el("statSupply").textContent = upnp ? `Supply ${fmtPnp(upnp.amount)}` : "Max 10,000,000 PNP";
    } catch {
      el("statSupply").textContent = "Max 10,000,000 PNP";
    }

    const start = Math.max(1, tip - LOOKBACK + 1);
    const blocks = [];
    const txs = [];
    for (let h = tip; h >= start; h--) {
      const j = await fetchJson(`${RPC}/block?height=${h}`);
      const block = j.result?.block;
      const rawTxs = block?.data?.txs || [];
      const row = {
        height: Number(block?.header?.height || h),
        hash: j.result?.block_id?.hash || "",
        time: block?.header?.time || "",
        numTxs: rawTxs.length,
        proposer: block?.header?.proposer_address || "",
        rawTxs,
      };
      blocks.push(row);
      if (txs.length < SHOW) {
        for (let i = 0; i < rawTxs.length && txs.length < SHOW; i++) {
          const hash = await txHashFromB64(rawTxs[i]);
          if (hash) {
            txs.push({
              hash,
              height: row.height,
              time: row.time,
              index: i,
              from: "—",
              to: "PointPay Chain",
              value: "0 PNP",
            });
          }
        }
      }
    }

    // Enrich recent txs with LCD tx details when available
    for (const t of txs.slice(0, 6)) {
      try {
        const lcdTx = await fetchJson(`${LCD}/cosmos/tx/v1beta1/txs/${t.hash}`);
        const body = lcdTx?.tx?.body?.messages?.[0];
        const type = (body?.["@type"] || "").split(".").pop() || "Msg";
        if (body?.from_address) t.from = body.from_address;
        if (body?.to_address) t.to = body.to_address;
        else t.to = type;
        const amt = body?.amount?.[0] || body?.token;
        if (amt?.denom === "upnp") t.value = fmtPnp(amt.amount);
        else if (amt?.amount) t.value = `${amt.amount} ${amt.denom || ""}`.trim();
      } catch {
        /* keep defaults */
      }
    }

    state.blocks = blocks.slice(0, SHOW);
    state.allBlocks = blocks;
    state.txs = txs;

    const txCount = txs.length;
    el("statTxs").textContent = txCount.toLocaleString();
    const secs = Math.max(1, LOOKBACK * 5);
    const tps = (txCount / secs).toFixed(2);
    el("statTps").textContent = `${txCount} in last ${LOOKBACK} blocks · ~${tps} TPS window`;

    renderLists();
    el("error").classList.add("hidden");
  }

  function renderLists() {
    const bl = el("blockList");
    if (!state.blocks.length) {
      bl.innerHTML = `<li class="empty">Waiting for blocks…</li>`;
    } else {
      bl.innerHTML = state.blocks
        .map(
          (b) => `
        <li>
          <div class="chip">Bk</div>
          <div class="row-main">
            <div>Block <button type="button" data-go="block:${b.height}">${b.height.toLocaleString()}</button></div>
            <div class="meta">${ago(b.time)}</div>
            <div class="meta">Validator <b class="mono">${shortHash(b.proposer || "genesis", 8, 8)}</b></div>
          </div>
          <div class="row-side">
            <button type="button" class="linkish" data-go="block:${b.height}">${b.numTxs} txn${b.numTxs === 1 ? "" : "s"}</button>
            <div class="amt">0 PNP</div>
          </div>
        </li>`
        )
        .join("");
    }

    const tl = el("txList");
    if (!state.txs.length) {
      tl.innerHTML = `<li class="empty">No transactions in the last ${LOOKBACK} blocks yet.</li>`;
    } else {
      tl.innerHTML = state.txs
        .map(
          (t) => `
        <li>
          <div class="chip tx">Tx</div>
          <div class="row-main">
            <button type="button" data-go="tx:${t.hash}">${shortHash(t.hash, 12, 10)}</button>
            <div class="meta">${ago(t.time)}</div>
            <div class="meta">
              From <b class="mono">${t.from === "—" ? "—" : shortHash(t.from, 6, 4)}</b>
              To <b class="mono">${shortHash(String(t.to), 8, 4)}</b>
            </div>
          </div>
          <div class="row-side">
            <div class="meta">Block <button type="button" class="linkish" data-go="block:${t.height}">${t.height}</button></div>
            <div class="amt">${t.value}</div>
          </div>
        </li>`
        )
        .join("");
    }
  }

  function showDetail(html) {
    const d = el("detail");
    d.classList.remove("hidden");
    d.innerHTML = `<button type="button" class="close" id="closeDetail">Close</button>${html}`;
    el("closeDetail").onclick = () => {
      d.classList.add("hidden");
      location.hash = "#/";
    };
  }

  async function showBlock(height) {
    const j = await fetchJson(`${RPC}/block?height=${height}`);
    if (!j.result?.block) throw new Error("Block not found");
    const block = j.result.block;
    const rawTxs = block.data?.txs || [];
    const hashes = [];
    for (const raw of rawTxs) hashes.push(await txHashFromB64(raw));
    showDetail(`
      <h3>Block Details</h3>
      <div class="kv">
        <div><div class="k">Block Height</div><div class="v mono" style="color:var(--blue)">${block.header?.height}</div></div>
        <div><div class="k">Block Hash</div><div class="v mono">${j.result.block_id?.hash || "—"}</div></div>
        <div><div class="k">Timestamp</div><div class="v">${block.header?.time || "—"} (${ago(block.header?.time || "")})</div></div>
        <div><div class="k">Validator / Proposer</div><div class="v mono">${block.header?.proposer_address || "—"}</div></div>
        <div><div class="k">Transactions</div>
          <div class="v">${
            hashes.length
              ? hashes.map((h) => `<div><a href="#/tx/${h}">${h}</a></div>`).join("")
              : "<span class='muted'>0 transactions in this block</span>"
          }</div>
        </div>
      </div>`);
  }

  async function showTx(hash) {
    const clean = hash.replace(/^0x/i, "").toUpperCase();
    const j = await fetchJson(`${RPC}/tx?hash=0x${clean}`);
    if (!j.result?.height && !j.result?.hash) throw new Error("Transaction not found");
    const r = j.result;
    let extra = "";
    try {
      const lcdTx = await fetchJson(`${LCD}/cosmos/tx/v1beta1/txs/${clean}`);
      const msgs = lcdTx?.tx?.body?.messages || [];
      extra = msgs
        .map((m, i) => {
          const type = m["@type"] || "msg";
          return `<div><div class="k">Message #${i + 1}</div><div class="v mono">${type}</div>
            ${m.from_address ? `<div class="v">From ${m.from_address}</div>` : ""}
            ${m.to_address ? `<div class="v">To ${m.to_address}</div>` : ""}</div>`;
        })
        .join("");
    } catch {
      /* optional */
    }
    showDetail(`
      <h3>Transaction Details</h3>
      <div class="kv">
        <div><div class="k">Transaction Hash</div><div class="v mono" style="color:var(--blue)">${(r.hash || clean).replace(/^0x/i, "").toUpperCase()}</div></div>
        <div><div class="k">Block</div><div class="v"><a href="#/block/${r.height}">${r.height}</a></div></div>
        <div><div class="k">Status</div><div class="v">${(r.tx_result?.code ?? 0) === 0 ? '<span style="color:#00a186">Success</span>' : "Failed"}</div></div>
        <div><div class="k">Gas Used / Wanted</div><div class="v mono">${r.tx_result?.gas_used || "—"} / ${r.tx_result?.gas_wanted || "—"}</div></div>
        ${extra}
      </div>`);
  }

  async function showAddr(address) {
    const bal = await fetchJson(`${LCD}/cosmos/bank/v1beta1/balances/${encodeURIComponent(address)}`);
    const balances = bal.balances || [];
    showDetail(`
      <h3>Address</h3>
      <div class="kv">
        <div><div class="k">Address</div><div class="v mono" style="color:var(--blue)">${address}</div></div>
        <div><div class="k">Balance</div>
          <div class="v">${
            balances.length
              ? balances
                  .map(
                    (b) =>
                      `<div style="display:flex;justify-content:space-between;gap:1rem;max-width:360px"><span class="muted">${b.denom}</span><span class="mono">${
                        b.denom === "upnp" ? fmtPnp(b.amount) : b.amount
                      }</span></div>`
                  )
                  .join("")
              : "<span class='muted'>0 PNP</span>"
          }</div>
        </div>
      </div>`);
  }

  async function loadValidators() {
    const list = el("validatorList");
    list.innerHTML = `<li class="empty">Loading validators…</li>`;
    try {
      const j = await fetchJson(`${LCD}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`);
      const vals = j.validators || [];
      if (!vals.length) {
        list.innerHTML = `<li class="empty">No bonded validators reported via LCD yet (single-node testnet).</li>`;
        return;
      }
      list.innerHTML = vals
        .map((v) => {
          const moniker = v.description?.moniker || "validator";
          const oper = v.operator_address || "";
          return `<li>
            <div class="chip">Val</div>
            <div class="row-main">
              <div><b>${moniker}</b></div>
              <div class="meta mono">${oper}</div>
              <div class="meta">Tokens ${v.tokens || "—"} · Status ${v.status || "—"}</div>
            </div>
            <div class="row-side"><div class="amt">${v.jailed ? "Jailed" : "Active"}</div></div>
          </li>`;
        })
        .join("");
    } catch (e) {
      list.innerHTML = `<li class="empty">Validators API unavailable: ${e.message}</li>`;
    }
  }

  async function runSearch(raw) {
    const query = raw.trim();
    if (!query) return;
    const filter = el("filter").value;
    el("searchBtn").disabled = true;
    try {
      if (filter === "block" || (/^\d+$/.test(query) && filter === "all")) {
        if (/^\d+$/.test(query)) {
          location.hash = `#/block/${query}`;
          return;
        }
      }
      if (filter === "addr" || (/^pnp1[a-z0-9]{20,}$/i.test(query) && (filter === "all" || filter === "addr"))) {
        if (/^pnp1[a-z0-9]{20,}$/i.test(query)) {
          location.hash = `#/addr/${query}`;
          return;
        }
      }
      if (filter === "tx" || (/^(0x)?[0-9A-Fa-f]{40,64}$/.test(query) && (filter === "all" || filter === "tx"))) {
        if (/^(0x)?[0-9A-Fa-f]{40,64}$/.test(query)) {
          location.hash = `#/tx/${query.replace(/^0x/i, "").toUpperCase()}`;
          return;
        }
      }
      if (/^\d+$/.test(query)) location.hash = `#/block/${query}`;
      else if (/^pnp1[a-z0-9]{20,}$/i.test(query)) location.hash = `#/addr/${query}`;
      else if (/^(0x)?[0-9A-Fa-f]{40,64}$/.test(query))
        location.hash = `#/tx/${query.replace(/^0x/i, "").toUpperCase()}`;
      else throw new Error("Enter a block height, tx hash, or pnp1… address");
    } catch (e) {
      el("error").textContent = e.message || String(e);
      el("error").classList.remove("hidden");
    } finally {
      el("searchBtn").disabled = false;
    }
  }

  function panels(mode) {
    el("homeGrid").classList.toggle("hidden", mode !== "home");
    el("fullListPanel").classList.toggle("hidden", mode !== "list");
    el("validatorsPanel").classList.toggle("hidden", mode !== "validators");
    el("stats").classList.toggle("hidden", mode === "validators");
  }

  async function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [kind, ...rest] = hash.split("/");
    const id = decodeURIComponent(rest.join("/"));
    el("error").classList.add("hidden");

    if (!kind || kind === "home") {
      panels("home");
      el("detail").classList.add("hidden");
      return;
    }
    if (kind === "blocks") {
      panels("list");
      el("fullListTitle").textContent = "Blocks";
      el("fullList").innerHTML = el("blockList").innerHTML;
      el("detail").classList.add("hidden");
      return;
    }
    if (kind === "txs") {
      panels("list");
      el("fullListTitle").textContent = "Transactions";
      el("fullList").innerHTML = el("txList").innerHTML;
      el("detail").classList.add("hidden");
      return;
    }
    if (kind === "validators") {
      panels("validators");
      el("detail").classList.add("hidden");
      await loadValidators();
      return;
    }

    panels("home");
    try {
      if (kind === "block") await showBlock(id);
      else if (kind === "tx") await showTx(id);
      else if (kind === "addr") await showAddr(id);
      else el("detail").classList.add("hidden");
    } catch (e) {
      el("detail").classList.add("hidden");
      el("error").textContent = e.message || String(e);
      el("error").classList.remove("hidden");
    }
  }

  document.body.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-go]");
    if (!t) return;
    const [kind, id] = t.getAttribute("data-go").split(":");
    location.hash = `#/${kind}/${id}`;
  });

  el("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    runSearch(el("q").value);
  });
  el("miniSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = el("miniSearch").querySelector("input").value;
    el("q").value = v;
    runSearch(v);
  });

  window.addEventListener("hashchange", route);

  async function boot() {
    try {
      await loadFeed();
      await route();
    } catch (e) {
      el("error").textContent = "RPC offline: " + (e.message || e);
      el("error").classList.remove("hidden");
    }
  }

  boot();
  setInterval(() => {
    loadFeed().then(route).catch(() => {});
  }, 8000);
})();
