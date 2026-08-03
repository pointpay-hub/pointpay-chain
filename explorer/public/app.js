(() => {
  const RPC = "/rpc";
  const LCD = "/lcd";
  const LOOKBACK = 80;
  const SHOW = 8;
  const LIST_PAGE = 25;

  const el = (id) => document.getElementById(id);
  const state = {
    blocks: [],
    txs: [],
    allBlocks: [],
    allTxs: [],
    tip: 0,
    chainId: "pointpay-dedicated-1",
    loadedAt: 0,
    listBlocksShown: LIST_PAGE,
    listTxsShown: LIST_PAGE,
    currentRoute: { kind: "home", id: "" },
    validators: { loaded: false, loading: false, mode: null },
  };

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
      for (let i = 0; i < rawTxs.length; i++) {
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

    // Enrich recent txs with LCD tx details when available
    for (const t of txs.slice(0, 12)) {
      await enrichTx(t);
    }
    await Promise.all(txs.slice(12, 30).map((t) => enrichTx(t)));

    state.blocks = blocks.slice(0, SHOW);
    state.allBlocks = blocks;
    state.allTxs = txs;
    state.txs = txs.slice(0, SHOW);

    const txCount = txs.length;
    el("statTxs").textContent = txCount.toLocaleString();
    const secs = Math.max(1, LOOKBACK * 5);
    const tps = (txCount / secs).toFixed(2);
    el("statTps").textContent = `${txCount} in last ${LOOKBACK} blocks · ~${tps} TPS window`;

    renderLists();
    el("error").classList.add("hidden");
  }

  async function enrichTx(t) {
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
    return t;
  }

  function renderBlockRows(blocks, limit) {
    const slice = blocks.slice(0, limit);
    if (!slice.length) return `<li class="empty">Waiting for blocks…</li>`;
    return slice
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

  function renderTxRows(txs, limit) {
    const slice = txs.slice(0, limit);
    if (!slice.length) return `<li class="empty">No transactions in the recent window yet.</li>`;
    return slice
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

  function renderLists() {
    el("blockList").innerHTML = renderBlockRows(state.blocks, SHOW);
    el("txList").innerHTML = renderTxRows(state.txs, SHOW);
  }

  function renderFullList(kind) {
    const panel = el("fullListPanel");
    const list = el("fullList");
    if (kind === "blocks") {
      el("fullListTitle").textContent = "Blocks";
      list.innerHTML = renderBlockRows(state.allBlocks, state.listBlocksShown);
      const more = state.listBlocksShown < state.allBlocks.length;
      list.innerHTML += more
        ? `<li><button type="button" class="load-more" id="loadMoreBlocks">Load more blocks</button></li>`
        : "";
      if (more) {
        el("loadMoreBlocks").onclick = () => {
          state.listBlocksShown += LIST_PAGE;
          renderFullList("blocks");
        };
      }
    } else {
      el("fullListTitle").textContent = "Transactions";
      list.innerHTML = renderTxRows(state.allTxs, state.listTxsShown);
      const more = state.listTxsShown < state.allTxs.length;
      list.innerHTML += more
        ? `<li><button type="button" class="load-more" id="loadMoreTxs">Load more transactions</button></li>`
        : "";
      if (more) {
        el("loadMoreTxs").onclick = () => {
          state.listTxsShown += LIST_PAGE;
          renderFullList("txs");
        };
      }
    }
    panel.classList.remove("hidden");
  }

  async function loadPendingTxs() {
    const list = el("pendingList");
    list.innerHTML = `<li class="empty">Loading mempool…</li>`;
    try {
      const j = await fetchJson(`${RPC}/unconfirmed_txs?limit=30`);
      const raw = j?.result?.txs || [];
      if (!raw.length) {
        list.innerHTML = `<li class="empty">No pending transactions in mempool.</li>`;
        return;
      }
      const rows = [];
      for (let i = 0; i < raw.length; i++) {
        const hash = await txHashFromB64(raw[i]);
        if (hash) rows.push({ hash, index: i });
      }
      list.innerHTML = rows
        .map(
          (t) => `
        <li>
          <div class="chip tx">⏳</div>
          <div class="row-main">
            <button type="button" data-go="tx:${t.hash}">${shortHash(t.hash, 12, 10)}</button>
            <div class="meta">Pending · index ${t.index}</div>
          </div>
          <div class="row-side"><span class="badge wait">Mempool</span></div>
        </li>`
        )
        .join("");
    } catch (e) {
      list.innerHTML = `<li class="empty">Mempool unavailable: ${e.message}. Single-validator testnet may expose limited unconfirmed_txs.</li>`;
    }
  }

  async function loadTopAccounts() {
    const list = el("accountList");
    list.innerHTML = `<li class="empty">Scanning recent blocks for accounts…</li>`;
    const seen = new Set();
    try {
      const valJ = await fetchJson(`${LCD}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`);
      for (const v of valJ?.validators || []) {
        if (v.operator_address) seen.add(v.operator_address);
      }
    } catch {
      /* optional */
    }
    for (const t of state.allTxs) {
      if (t.from && t.from !== "—") seen.add(t.from);
      if (t.to && !String(t.to).includes("Msg")) seen.add(String(t.to));
    }
    const addrs = [...seen].slice(0, 40);
    const ranked = [];
    await Promise.all(
      addrs.map(async (address) => {
        try {
          const bal = await fetchJson(`${LCD}/cosmos/bank/v1beta1/balances/${encodeURIComponent(address)}`);
          const upnp = (bal?.balances || []).find((b) => b.denom === "upnp");
          const amount = upnp ? Number(upnp.amount) : 0;
          ranked.push({ address, amount });
        } catch {
          ranked.push({ address, amount: 0 });
        }
      })
    );
    ranked.sort((a, b) => b.amount - a.amount);
    if (!ranked.length) {
      list.innerHTML = `<li class="empty">No accounts found in recent activity.</li>`;
      return;
    }
    list.innerHTML = ranked
      .slice(0, 25)
      .map(
        (a, i) => `
      <li>
        <div class="chip">#${i + 1}</div>
        <div class="row-main">
          <button type="button" data-go="addr:${a.address}">${shortHash(a.address, 14, 10)}</button>
          <div class="meta mono">${a.address}</div>
        </div>
        <div class="row-side"><div class="amt">${fmtPnp(a.amount)}</div></div>
      </li>`
      )
      .join("");
  }

  async function showTokenPage() {
    const panel = el("tokenPanel");
    panel.classList.remove("hidden");
    let supply = "Max 10,000,000 PNP";
    try {
      const sup = await fetchJson(`${LCD}/cosmos/bank/v1beta1/supply`);
      const upnp = (sup?.supply || []).find((c) => c.denom === "upnp");
      if (upnp) supply = fmtPnp(upnp.amount) + " on-chain";
    } catch {
      /* default */
    }
    panel.innerHTML = `
      <a href="#/" class="back" style="float:right">← Home</a>
      <h3>PNP — Native Coin</h3>
      <div class="kv">
        <div><div class="k">Symbol</div><div class="v">PNP</div></div>
        <div><div class="k">Base denom</div><div class="v mono">upnp (6 decimals)</div></div>
        <div><div class="k">Chain supply</div><div class="v">${supply}</div></div>
        <div><div class="k">Max supply (venue cap)</div><div class="v">10,000,000 PNP worldwide</div></div>
        <div><div class="k">Address prefix</div><div class="v mono">pnp1…</div></div>
        <div><div class="k">Venue trading</div><div class="v"><a href="https://pointpay.exchange/trade/spot?symbol=PNP" target="_blank" rel="noopener">PNP/USDT on PointPay Exchange →</a></div></div>
      </div>
      <p class="panel-note" style="padding-left:0;margin-top:1rem">Cosmos-native asset — not an ERC-20/BEP-20 on this testnet. EVM-style verified contracts &amp; internal txs are not applicable.</p>`;
  }

  async function addressTxHistory(address) {
    const hits = [];
    for (const t of state.allTxs) {
      if (t.from === address || t.to === address) hits.push(t);
    }
    if (!hits.length) return "<span class='muted'>No txs in recent block window</span>";
    return hits
      .slice(0, 8)
      .map((t) => `<div><a href="#/tx/${t.hash}">${shortHash(t.hash, 12, 8)}</a> · block ${t.height}</div>`)
      .join("");
  }

  async function showAddr(address) {
    const bal = await fetchJson(`${LCD}/cosmos/bank/v1beta1/balances/${encodeURIComponent(address)}`);
    const balances = bal.balances || [];
    const hist = await addressTxHistory(address);
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
        <div><div class="k">Recent transactions</div><div class="v">${hist}</div></div>
      </div>`);
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

  async function proposerFromPubKey(pubkey) {
    if (!pubkey?.key) return "";
    const raw = b64ToBytes(pubkey.key);
    const hash = await crypto.subtle.digest("SHA-256", raw);
    return [...new Uint8Array(hash).slice(0, 20)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  function fmtVotingPower(tokens) {
    const n = Number(tokens || 0) / 1e6;
    if (!Number.isFinite(n) || n === 0) return "0 PNP";
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M PNP`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K PNP`;
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} PNP`;
  }

  function rankMedal(rank) {
    if (rank === 1) return '<span class="val-medal">🥇</span>';
    if (rank === 2) return '<span class="val-medal">🥈</span>';
    if (rank === 3) return '<span class="val-medal">🥉</span>';
    return "";
  }

  async function scanBlockHeights(from, to) {
    const rows = [];
    for (let h = to; h >= from; h--) {
      try {
        const j = await fetchJson(`${RPC}/block?height=${h}`);
        const block = j.result?.block;
        if (!block) continue;
        rows.push({
          height: Number(block.header?.height || h),
          time: block.header?.time || "",
          proposer: (block.header?.proposer_address || "").toUpperCase(),
        });
      } catch {
        /* skip missing */
      }
    }
    return rows;
  }

  async function loadValidators(mode = "leaderboard", { silent = false } = {}) {
    if (state.validators.loading) return;
    state.validators.loading = true;

    const tbody = el("validatorList");
    const setPanel = el("validatorSetInfo");
    const tableWrap = el("validatorTableWrap");
    const hasRows = tbody.querySelector("tr:not(.empty)") && state.validators.loaded;

    if (!silent || !hasRows) {
      el("validatorsTitle").textContent =
        mode === "set" ? "Validators Set Info" : "Validators Top Leaderboard (Blocks Validated)";
      tbody.innerHTML = `<tr><td colspan="9" class="empty">Loading validators…</td></tr>`;
      setPanel.classList.add("hidden");
      tableWrap.classList.toggle("hidden", mode === "set");
    }

    try {
      const valJ = await fetchJson(`${LCD}/cosmos/staking/v1beta1/validators?pagination.limit=200`);
      const vals = valJ.validators || [];
      if (!vals.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty">No validators reported via LCD (single-node testnet may still produce blocks).</td></tr>`;
        el("validatorsSub").textContent = "0 validators found";
        state.validators.loaded = true;
        state.validators.mode = mode;
        return;
      }

      const proposerMap = new Map();
      for (const v of vals) {
        const proposer = await proposerFromPubKey(v.consensus_pubkey);
        if (proposer) proposerMap.set(proposer, v);
      }

      const tip = state.tip || Number((await fetchJson(`${RPC}/status`)).result?.sync_info?.latest_block_height || 0);
      const blocks = state.allBlocks.length
        ? state.allBlocks.map((b) => ({
            height: b.height,
            time: b.time,
            proposer: (b.proposer || "").toUpperCase(),
          }))
        : [];

      const now = Date.now();
      const day = 86400000;
      const stats = new Map();

      for (const b of blocks) {
        const key = b.proposer || "UNKNOWN";
        if (!stats.has(key)) {
          stats.set(key, { first: b.height, last: b.height, total: 0, d1: 0, d7: 0, d30: 0 });
        }
        const s = stats.get(key);
        s.total++;
        if (b.height < s.first) s.first = b.height;
        if (b.height > s.last) s.last = b.height;
        const age = now - new Date(b.time).getTime();
        if (age <= day) s.d1++;
        if (age <= 7 * day) s.d7++;
        if (age <= 30 * day) s.d30++;
      }

      if (mode === "set") {
        tableWrap.classList.add("hidden");
        setPanel.classList.remove("hidden");
        setPanel.innerHTML = `
          <div class="kv">
            <div><div class="k">Chain ID</div><div class="v mono">${state.chainId}</div></div>
            <div><div class="k">Active validators</div><div class="v">${vals.filter((v) => v.status === "BOND_STATUS_BONDED" && !v.jailed).length}</div></div>
            <div><div class="k">Total validators</div><div class="v">${vals.length}</div></div>
            <div><div class="k">Block scan window</div><div class="v">${blocks.length.toLocaleString()} recent blocks · tip ${tip.toLocaleString()}</div></div>
          </div>
          <p class="panel-note" style="padding-left:0;margin-top:1rem">Cosmos SDK validator set · proposer stats from recent on-chain blocks.</p>`;
        el("validatorsSub").textContent = `${vals.length} validator${vals.length === 1 ? "" : "s"} in set`;
        state.validators.loaded = true;
        state.validators.mode = mode;
        return;
      }

      const rows = vals.map((v) => {
        const proposer = [...proposerMap.entries()].find(([, val]) => val.operator_address === v.operator_address)?.[0] || "";
        const st = proposer ? stats.get(proposer) : null;
        return {
          v,
          proposer,
          blocks: st?.total || 0,
          first: st?.first || "—",
          last: st?.last || "—",
          d1: st?.d1 || 0,
          d7: st?.d7 || 0,
          d30: st?.d30 || 0,
        };
      });
      rows.sort((a, b) => b.blocks - a.blocks || Number(b.v.tokens) - Number(a.v.tokens));

      el("validatorsSub").textContent = `Showing 1 to ${rows.length} of ${rows.length} validators · ${blocks.length.toLocaleString()} recent blocks`;

      tbody.innerHTML = rows
        .map((row, i) => {
          const rank = i + 1;
          const v = row.v;
          const oper = v.operator_address || "";
          const moniker = v.description?.moniker || "validator";
          const active = v.status === "BOND_STATUS_BONDED" && !v.jailed;
          return `<tr>
            <td class="val-rank">${rankMedal(rank)}${rank}</td>
            <td>
              <span class="val-addr" title="${moniker}">
                <button type="button" data-go="addr:${oper}">${shortHash(oper, 8, 6)}</button>
                <button type="button" class="val-copy" data-copy="${oper}" title="Copy">⧉</button>
              </span>
            </td>
            <td><span class="val-power"><span class="val-bar"></span>${fmtVotingPower(v.tokens)}</span></td>
            <td>${row.first === "—" ? "—" : `<a href="#/block/${row.first}">${row.first.toLocaleString()}</a>`}</td>
            <td>${row.last === "—" ? "—" : `<a href="#/block/${row.last}">${row.last.toLocaleString()}</a>`}</td>
            <td>${row.d1.toLocaleString()}</td>
            <td>${row.d7.toLocaleString()}</td>
            <td>${row.d30.toLocaleString()}</td>
            <td class="${active ? "val-active-yes" : "val-active-no"}">${active ? "✓ Yes" : "✗ No"}</td>
          </tr>`;
        })
        .join("");
      state.validators.loaded = true;
      state.validators.mode = mode;
    } catch (e) {
      if (!silent || !hasRows) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty">Validators unavailable: ${e.message}</td></tr>`;
        el("validatorsSub").textContent = "Error loading validators";
      }
    } finally {
      state.validators.loading = false;
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
    el("pendingPanel").classList.toggle("hidden", mode !== "pending");
    el("accountsPanel").classList.toggle("hidden", mode !== "accounts");
    el("tokenPanel").classList.toggle("hidden", mode !== "token");
    el("toolsPanel").classList.toggle("hidden", mode !== "tools");
    el("stats").classList.toggle("hidden", mode !== "home" && mode !== "list");
  }

  window.__pnpExplorerExport = () => ({
    txs: state.allTxs,
    blocks: state.allBlocks,
  });

  async function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [kind, ...rest] = hash.split("/");
    const id = decodeURIComponent(rest.join("/"));
    const prev = state.currentRoute;
    state.currentRoute = { kind: kind || "home", id };

    if (prev.kind !== state.currentRoute.kind || prev.id !== state.currentRoute.id) {
      state.validators.loaded = false;
    }

    el("error").classList.add("hidden");
    el("tokenPanel").classList.add("hidden");
    el("toolsPanel").classList.add("hidden");

    if (!kind || kind === "home") {
      panels("home");
      el("detail").classList.add("hidden");
      return;
    }
    if (kind === "blocks") {
      panels("list");
      el("detail").classList.add("hidden");
      renderFullList("blocks");
      return;
    }
    if (kind === "txs") {
      panels("list");
      el("detail").classList.add("hidden");
      renderFullList("txs");
      return;
    }
    if (kind === "pending") {
      panels("pending");
      el("detail").classList.add("hidden");
      await loadPendingTxs();
      return;
    }
    if (kind === "accounts") {
      panels("accounts");
      el("detail").classList.add("hidden");
      await loadTopAccounts();
      return;
    }
    if (kind === "validators") {
      panels("validators");
      el("detail").classList.add("hidden");
      await loadValidators(id === "set" ? "set" : "leaderboard");
      return;
    }
    if (kind === "token" && id === "pnp") {
      panels("token");
      el("detail").classList.add("hidden");
      await showTokenPage();
      el("tokenPanel").classList.remove("hidden");
      return;
    }
    if (kind === "tools" && id) {
      panels("tools");
      el("detail").classList.add("hidden");
      const panel = el("toolsPanel");
      panel.classList.remove("hidden");
      if (window.PnpTools) window.PnpTools.render(id, panel);
      else panel.innerHTML = "<p class='muted'>Tools failed to load.</p>";
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
    const copyBtn = ev.target.closest("[data-copy]");
    if (copyBtn) {
      const text = copyBtn.getAttribute("data-copy");
      if (text) navigator.clipboard?.writeText(text).catch(() => {});
      return;
    }
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
  setInterval(async () => {
    try {
      await loadFeed();
      const { kind, id } = state.currentRoute;
      if (!kind || kind === "home") {
        renderLists();
      } else if (kind === "validators") {
        await loadValidators(id === "set" ? "set" : "leaderboard", { silent: true });
      }
    } catch {
      /* background refresh — keep current UI */
    }
  }, 8000);
})();
