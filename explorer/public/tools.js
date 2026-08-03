(() => {
  const RPC = "/rpc";
  const LCD = "/lcd";

  async function fetchJson(url, opts, ms = 12000) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
      const res = await fetch(url, { ...opts, signal: ac.signal });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      if (!res.ok) throw new Error(typeof data === "object" && data.message ? data.message : `${res.status}`);
      return data;
    } finally {
      clearTimeout(t);
    }
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtPnp(amountBase) {
    const n = Number(amountBase || 0) / 1e6;
    if (!Number.isFinite(n)) return "—";
    return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} PNP`;
  }

  function toolShell(title, subtitle, body) {
    return `
      <a href="#/" class="back" style="float:right">← Home</a>
      <h3>${esc(title)}</h3>
      ${subtitle ? `<p class="panel-note" style="padding-left:0;margin-top:0">${subtitle}</p>` : ""}
      <div class="tool-body">${body}</div>`;
  }

  function evmStub(title) {
    return toolShell(
      title,
      "PointPay Chain testnet is Cosmos SDK (Tendermint), not EVM. These BscScan tools apply to BNB Smart Chain only.",
      `<div class="tool-result muted">
        <p>Use <a href="https://testnet.bscscan.com/" target="_blank" rel="noopener">BscScan Testnet</a> for Solidity contracts, bytecode, and Method IDs.</p>
        <p>On PNP testnet: native <code>upnp</code> coin, <code>pnp1…</code> addresses, and protobuf messages — see <a href="#/tools/tx-decoder">Tx Message Decoder</a>.</p>
      </div>`
    );
  }

  const MSG_TYPES = {
    "/cosmos.bank.v1beta1.MsgSend": "Transfer coins between accounts",
    "/cosmos.staking.v1beta1.MsgDelegate": "Delegate stake to validator",
    "/cosmos.staking.v1beta1.MsgUndelegate": "Undelegate stake",
    "/cosmos.staking.v1beta1.MsgBeginRedelegate": "Redelegate between validators",
    "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": "Withdraw staking rewards",
    "/cosmos.gov.v1beta1.MsgVote": "Governance vote",
    "/cosmos.gov.v1.MsgVote": "Governance vote (v1)",
  };

  const tools = {
    unit: () =>
      toolShell(
        "Unit Converter",
        "PNP uses 6 decimal places · base denom <code>upnp</code> (micro-PNP).",
        `<div class="tool-grid2">
          <label class="tool-field"><span>PNP (display)</span><input type="text" id="toolUnitPnp" placeholder="1.5" /></label>
          <label class="tool-field"><span>upnp (base)</span><input type="text" id="toolUnitUpnp" placeholder="1500000" /></label>
        </div>
        <div class="tool-actions"><button type="button" class="tool-btn" id="toolUnitConvert">Convert</button></div>
        <div class="tool-result" id="toolUnitOut">Enter a value and convert.</div>`
      ),

    base64: () =>
      toolShell(
        "Base64 Converter",
        "Encode or decode text / hex for Cosmos transaction bytes.",
        `<label class="tool-field"><span>Input</span><textarea id="toolB64In" rows="4" placeholder="Text or base64…"></textarea></label>
        <div class="tool-actions">
          <button type="button" class="tool-btn" id="toolB64Enc">Encode → Base64</button>
          <button type="button" class="tool-btn secondary" id="toolB64Dec">Decode ← Base64</button>
        </div>
        <label class="tool-field"><span>Output</span><textarea id="toolB64Out" rows="4" readonly></textarea></label>`
      ),

    "block-date": () =>
      toolShell(
        "Block & Date Converter",
        "Lookup block timestamp or estimate block height from UTC time (≈5s block time).",
        `<div class="tool-grid2">
          <label class="tool-field"><span>Block height</span><input type="number" id="toolBdHeight" min="1" placeholder="Latest" /></label>
          <label class="tool-field"><span>UTC date/time</span><input type="datetime-local" id="toolBdDate" /></label>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" id="toolBdFromHeight">Height → Time</button>
          <button type="button" class="tool-btn secondary" id="toolBdFromDate">Time → Height</button>
        </div>
        <div class="tool-result" id="toolBdOut">Enter a height or pick a date.</div>`
      ),

    utf8: () =>
      toolShell(
        "UTF-8 Converter",
        "Convert between plain text and hexadecimal bytes.",
        `<label class="tool-field"><span>Text</span><textarea id="toolUtf8Text" rows="3"></textarea></label>
        <label class="tool-field"><span>Hex (no 0x prefix)</span><textarea id="toolUtf8Hex" rows="3" placeholder="48656c6c6f"></textarea></label>
        <div class="tool-actions">
          <button type="button" class="tool-btn" id="toolUtf8ToHex">Text → Hex</button>
          <button type="button" class="tool-btn secondary" id="toolUtf8ToText">Hex → Text</button>
        </div>`
      ),

    "msg-type": () =>
      toolShell(
        "Message Type Lookup",
        "Cosmos protobuf message paths (BscScan “Method ID” equivalent).",
        `<label class="tool-field"><span>Message type path</span>
          <input type="text" id="toolMsgIn" placeholder="/cosmos.bank.v1beta1.MsgSend" list="msgTypeList" /></label>
        <datalist id="msgTypeList">${Object.keys(MSG_TYPES)
          .map((k) => `<option value="${esc(k)}">`)
          .join("")}</datalist>
        <div class="tool-result" id="toolMsgOut">Pick or paste a <code>@type</code> from a transaction.</div>
        <h4 class="tool-subhead">Common types</h4>
        <ul class="tool-list">${Object.entries(MSG_TYPES)
          .map(([k, v]) => `<li><code>${esc(k)}</code> — ${esc(v)}</li>`)
          .join("")}</ul>`
      ),

    "api-docs": () =>
      toolShell(
        "API Documentation",
        "Public endpoints proxied through PNPScan (same origin).",
        `<div class="kv">
          <div><div class="k">Tendermint RPC</div><div class="v mono"><a href="${RPC}/status" target="_blank" rel="noopener">${RPC}/status</a></div></div>
          <div><div class="k">Block</div><div class="v mono">${RPC}/block?height=N</div></div>
          <div><div class="k">Transaction</div><div class="v mono">${RPC}/tx?hash=0x…</div></div>
          <div><div class="k">Mempool</div><div class="v mono">${RPC}/unconfirmed_txs</div></div>
          <div><div class="k">Broadcast</div><div class="v mono">JSON-RPC POST · broadcast_tx_sync</div></div>
          <div><div class="k">Cosmos LCD (REST)</div><div class="v mono"><a href="${LCD}/" target="_blank" rel="noopener">${LCD}/</a></div></div>
          <div><div class="k">Bank balances</div><div class="v mono">${LCD}/cosmos/bank/v1beta1/balances/{address}</div></div>
          <div><div class="k">Tx by hash</div><div class="v mono">${LCD}/cosmos/tx/v1beta1/txs/{hash}</div></div>
          <div><div class="k">Decode tx bytes</div><div class="v mono">POST ${LCD}/cosmos/tx/v1beta1/decode</div></div>
          <div><div class="k">Validators</div><div class="v mono">${LCD}/cosmos/staking/v1beta1/validators</div></div>
        </div>
        <p class="panel-note" style="padding-left:0">External gateways: <a href="https://rpc-testnet.pointpay.exchange/" target="_blank" rel="noopener">rpc-testnet</a> · <a href="https://api-testnet.pointpay.exchange/" target="_blank" rel="noopener">api-testnet</a></p>`
      ),

    broadcast: () =>
      toolShell(
        "Broadcast Transaction",
        "Submit a signed transaction (base64 <code>tx_bytes</code>) to the testnet mempool.",
        `<label class="tool-field"><span>Signed tx (base64)</span>
          <textarea id="toolBroadcastIn" rows="5" placeholder="CpAB…"></textarea></label>
        <div class="tool-actions">
          <button type="button" class="tool-btn" id="toolBroadcastSync">Broadcast (sync)</button>
          <button type="button" class="tool-btn secondary" id="toolBroadcastAsync">Broadcast (async)</button>
        </div>
        <pre class="tool-pre" id="toolBroadcastOut">Result appears here.</pre>`
      ),

    "verify-contract": () => evmStub("Verify Contract"),
    "contract-diff": () => evmStub("Contract Diff Checker"),
    "similar-contract": () => evmStub("Similar Contract Search"),
    vyper: () => evmStub("Vyper Online Compiler"),
    bytecode: () => evmStub("Bytecode to Opcode"),

    "csv-export": () =>
      toolShell(
        "CSV Export",
        "Download recent blocks and transactions already loaded by the explorer.",
        `<div class="tool-actions">
          <button type="button" class="tool-btn" id="toolCsvTxs">Export transactions CSV</button>
          <button type="button" class="tool-btn secondary" id="toolCsvBlocks">Export blocks CSV</button>
        </div>
        <div class="tool-result" id="toolCsvNote">Uses the last ~80 blocks cached on this page.</div>`
      ),

    "tx-decoder": () =>
      toolShell(
        "Input Data Decoder",
        "Decode base64 transaction bytes into JSON messages (Cosmos SDK).",
        `<label class="tool-field"><span>Tx bytes (base64)</span>
          <textarea id="toolDecodeIn" rows="5" placeholder="Paste base64 from wallet or block data…"></textarea></label>
        <div class="tool-actions"><button type="button" class="tool-btn" id="toolDecodeRun">Decode</button></div>
        <pre class="tool-pre" id="toolDecodeOut">{}</pre>`
      ),

    "tx-encoder": () =>
      toolShell(
        "Message Builder (Beta)",
        "Build a <code>MsgSend</code> JSON template — sign with Keplr / CLI before broadcast.",
        `<div class="tool-grid2">
          <label class="tool-field"><span>From (pnp1…)</span><input type="text" id="toolEncFrom" placeholder="pnp1…" /></label>
          <label class="tool-field"><span>To (pnp1…)</span><input type="text" id="toolEncTo" placeholder="pnp1…" /></label>
          <label class="tool-field"><span>Amount (PNP)</span><input type="text" id="toolEncAmt" placeholder="1.0" /></label>
        </div>
        <div class="tool-actions"><button type="button" class="tool-btn" id="toolEncBuild">Build JSON</button></div>
        <pre class="tool-pre" id="toolEncOut">{}</pre>`
      ),

    balance: () =>
      toolShell(
        "Account Balance Checker",
        "Live balance via Cosmos bank module.",
        `<label class="tool-field"><span>Address</span><input type="text" id="toolBalAddr" placeholder="pnp1…" /></label>
        <div class="tool-actions"><button type="button" class="tool-btn" id="toolBalRun">Check balance</button></div>
        <div class="tool-result" id="toolBalOut">Enter a <code>pnp1…</code> address.</div>`
      ),

    supply: () =>
      toolShell(
        "Token Supply Checker",
        "On-chain bank supply for native PNP.",
        `<div class="tool-actions"><button type="button" class="tool-btn" id="toolSupplyRun">Refresh supply</button></div>
        <div class="tool-result" id="toolSupplyOut">Click refresh.</div>`
      ),

    "token-standard": () =>
      toolShell(
        "Token Standard Checker",
        "PNP on PointPay Chain is a native Cosmos bank coin — not BEP-20 / ERC-20.",
        `<div class="kv">
          <div><div class="k">Asset</div><div class="v">PNP (native)</div></div>
          <div><div class="k">Base denom</div><div class="v mono">upnp</div></div>
          <div><div class="k">Decimals</div><div class="v">6</div></div>
          <div><div class="k">Address prefix</div><div class="v mono">pnp</div></div>
          <div><div class="k">Module</div><div class="v">x/bank (Cosmos SDK)</div></div>
          <div><div class="k">EVM contract</div><div class="v muted">Not applicable on this testnet</div></div>
        </div>
        <p class="panel-note" style="padding-left:0"><a href="#/token/pnp">PNP token page →</a></p>`
      ),
  };

  function bindToolHandlers(id, panel) {
    if (id === "unit") {
      const convert = () => {
        const pnp = panel.querySelector("#toolUnitPnp").value.trim();
        const upnp = panel.querySelector("#toolUnitUpnp").value.trim();
        const out = panel.querySelector("#toolUnitOut");
        if (pnp) {
          const n = Number(pnp);
          if (!Number.isFinite(n)) {
            out.textContent = "Invalid PNP number.";
            return;
          }
          out.innerHTML = `<strong>${n} PNP</strong> = <code class="mono">${Math.round(n * 1e6).toLocaleString()}</code> upnp`;
        } else if (upnp) {
          const n = Number(upnp.replace(/,/g, ""));
          if (!Number.isFinite(n)) {
            out.textContent = "Invalid upnp integer.";
            return;
          }
          out.innerHTML = `<code class="mono">${n.toLocaleString()}</code> upnp = <strong>${(n / 1e6).toLocaleString(undefined, { maximumFractionDigits: 6 })} PNP</strong>`;
        } else out.textContent = "Enter PNP or upnp.";
      };
      panel.querySelector("#toolUnitConvert").onclick = convert;
      panel.querySelector("#toolUnitPnp").addEventListener("input", () => {
        panel.querySelector("#toolUnitUpnp").value = "";
      });
      panel.querySelector("#toolUnitUpnp").addEventListener("input", () => {
        panel.querySelector("#toolUnitPnp").value = "";
      });
    }

    if (id === "base64") {
      panel.querySelector("#toolB64Enc").onclick = () => {
        const v = panel.querySelector("#toolB64In").value;
        panel.querySelector("#toolB64Out").value = btoa(unescape(encodeURIComponent(v)));
      };
      panel.querySelector("#toolB64Dec").onclick = () => {
        try {
          const v = panel.querySelector("#toolB64In").value.trim();
          panel.querySelector("#toolB64Out").value = decodeURIComponent(escape(atob(v)));
        } catch (e) {
          panel.querySelector("#toolB64Out").value = "Invalid base64: " + e.message;
        }
      };
    }

    if (id === "block-date") {
      const out = panel.querySelector("#toolBdOut");
      panel.querySelector("#toolBdFromHeight").onclick = async () => {
        out.textContent = "Loading…";
        try {
          let h = panel.querySelector("#toolBdHeight").value.trim();
          if (!h) {
            const st = await fetchJson(`${RPC}/status`);
            h = st.result?.sync_info?.latest_block_height;
          }
          const j = await fetchJson(`${RPC}/block?height=${h}`);
          const t = j.result?.block?.header?.time;
          out.innerHTML = `Block <a href="#/block/${h}">${h}</a><br/>UTC: <strong>${esc(t)}</strong>`;
        } catch (e) {
          out.textContent = e.message;
        }
      };
      panel.querySelector("#toolBdFromDate").onclick = async () => {
        const raw = panel.querySelector("#toolBdDate").value;
        if (!raw) {
          out.textContent = "Pick a date/time.";
          return;
        }
        out.textContent = "Estimating…";
        try {
          const target = new Date(raw).getTime();
          const st = await fetchJson(`${RPC}/status`);
          const tip = Number(st.result?.sync_info?.latest_block_height || 0);
          const tipBlock = await fetchJson(`${RPC}/block?height=${tip}`);
          const tipTime = new Date(tipBlock.result?.block?.header?.time || Date.now()).getTime();
          const blockTime = 5000;
          const deltaBlocks = Math.round((tipTime - target) / blockTime);
          const est = Math.max(1, tip - deltaBlocks);
          out.innerHTML = `Estimated block: <a href="#/block/${est}"><strong>${est}</strong></a> (± few blocks, ~5s target)`;
        } catch (e) {
          out.textContent = e.message;
        }
      };
    }

    if (id === "utf8") {
      panel.querySelector("#toolUtf8ToHex").onclick = () => {
        const t = panel.querySelector("#toolUtf8Text").value;
        panel.querySelector("#toolUtf8Hex").value = [...new TextEncoder().encode(t)]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      };
      panel.querySelector("#toolUtf8ToText").onclick = () => {
        try {
          const hex = panel.querySelector("#toolUtf8Hex").value.replace(/\s/g, "");
          const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((x) => parseInt(x, 16)));
          panel.querySelector("#toolUtf8Text").value = new TextDecoder().decode(bytes);
        } catch (e) {
          panel.querySelector("#toolUtf8Text").value = "Invalid hex: " + e.message;
        }
      };
    }

    if (id === "msg-type") {
      const run = () => {
        const v = panel.querySelector("#toolMsgIn").value.trim();
        const out = panel.querySelector("#toolMsgOut");
        if (!v) {
          out.textContent = "Enter a message type path.";
          return;
        }
        out.innerHTML = MSG_TYPES[v]
          ? `<strong>${esc(v)}</strong><br/>${esc(MSG_TYPES[v])}`
          : `<span class="muted">No local description.</span> Type: <code>${esc(v)}</code>`;
      };
      panel.querySelector("#toolMsgIn").addEventListener("input", run);
      run();
    }

    if (id === "broadcast") {
      const broadcast = async (mode) => {
        const tx = panel.querySelector("#toolBroadcastIn").value.trim();
        const out = panel.querySelector("#toolBroadcastOut");
        if (!tx) {
          out.textContent = "Paste base64 signed tx.";
          return;
        }
        out.textContent = "Broadcasting…";
        try {
          const method = mode === "async" ? "broadcast_tx_async" : "broadcast_tx_sync";
          const res = await fetchJson(RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: [tx] }),
          });
          out.textContent = JSON.stringify(res, null, 2);
        } catch (e) {
          out.textContent = e.message;
        }
      };
      panel.querySelector("#toolBroadcastSync").onclick = () => broadcast("sync");
      panel.querySelector("#toolBroadcastAsync").onclick = () => broadcast("async");
    }

    if (id === "csv-export") {
      const download = (name, rows) => {
        const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
      };
      panel.querySelector("#toolCsvTxs").onclick = () => {
        const data = window.__pnpExplorerExport?.();
        if (!data?.txs?.length) {
          panel.querySelector("#toolCsvNote").textContent = "No transactions loaded yet — wait for home feed.";
          return;
        }
        download("pnpscan-transactions.csv", [
          ["hash", "height", "time", "from", "to", "value"],
          ...data.txs.map((t) => [t.hash, t.height, t.time, t.from, t.to, t.value]),
        ]);
        panel.querySelector("#toolCsvNote").textContent = `Exported ${data.txs.length} transactions.`;
      };
      panel.querySelector("#toolCsvBlocks").onclick = () => {
        const data = window.__pnpExplorerExport?.();
        if (!data?.blocks?.length) {
          panel.querySelector("#toolCsvNote").textContent = "No blocks loaded yet.";
          return;
        }
        download("pnpscan-blocks.csv", [
          ["height", "hash", "time", "tx_count", "proposer"],
          ...data.blocks.map((b) => [b.height, b.hash, b.time, b.numTxs, b.proposer]),
        ]);
        panel.querySelector("#toolCsvNote").textContent = `Exported ${data.blocks.length} blocks.`;
      };
    }

    if (id === "tx-decoder") {
      panel.querySelector("#toolDecodeRun").onclick = async () => {
        const txBytes = panel.querySelector("#toolDecodeIn").value.trim();
        const out = panel.querySelector("#toolDecodeOut");
        if (!txBytes) {
          out.textContent = "Paste base64 tx bytes.";
          return;
        }
        out.textContent = "Decoding…";
        try {
          const j = await fetchJson(`${LCD}/cosmos/tx/v1beta1/decode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tx_bytes: txBytes }),
          });
          out.textContent = JSON.stringify(j, null, 2);
        } catch (e) {
          out.textContent = "Decode failed: " + e.message;
        }
      };
    }

    if (id === "tx-encoder") {
      panel.querySelector("#toolEncBuild").onclick = () => {
        const from = panel.querySelector("#toolEncFrom").value.trim();
        const to = panel.querySelector("#toolEncTo").value.trim();
        const amt = Number(panel.querySelector("#toolEncAmt").value.trim());
        const out = panel.querySelector("#toolEncOut");
        if (!from || !to || !Number.isFinite(amt)) {
          out.textContent = "Fill from, to, and amount.";
          return;
        }
        const micro = Math.round(amt * 1e6);
        out.textContent = JSON.stringify(
          {
            body: {
              messages: [
                {
                  "@type": "/cosmos.bank.v1beta1.MsgSend",
                  from_address: from,
                  to_address: to,
                  amount: [{ denom: "upnp", amount: String(micro) }],
                },
              ],
              memo: "",
            },
            auth_info: { fee: { amount: [], gas_limit: "200000" } },
            note: "Sign with pointpayd/Keplr — this is an unsigned template only.",
          },
          null,
          2
        );
      };
    }

    if (id === "balance") {
      panel.querySelector("#toolBalRun").onclick = async () => {
        const addr = panel.querySelector("#toolBalAddr").value.trim();
        const out = panel.querySelector("#toolBalOut");
        if (!/^pnp1[a-z0-9]{20,}$/i.test(addr)) {
          out.textContent = "Enter a valid pnp1… address.";
          return;
        }
        out.textContent = "Loading…";
        try {
          const bal = await fetchJson(`${LCD}/cosmos/bank/v1beta1/balances/${encodeURIComponent(addr)}`);
          const lines = (bal.balances || []).map((b) =>
            b.denom === "upnp" ? fmtPnp(b.amount) : `${b.amount} ${b.denom}`
          );
          out.innerHTML = lines.length
            ? lines.map((l) => `<div><strong>${esc(l)}</strong></div>`).join("")
            : "<span class='muted'>0 balance</span>";
        } catch (e) {
          out.textContent = e.message;
        }
      };
    }

    if (id === "supply") {
      const run = async () => {
        const out = panel.querySelector("#toolSupplyOut");
        out.textContent = "Loading…";
        try {
          const sup = await fetchJson(`${LCD}/cosmos/bank/v1beta1/supply`);
          const upnp = (sup.supply || []).find((c) => c.denom === "upnp");
          out.innerHTML = upnp
            ? `<div>Total supply: <strong>${fmtPnp(upnp.amount)}</strong></div><div class="muted mono">${Number(upnp.amount).toLocaleString()} upnp</div>`
            : "upnp supply not reported.";
        } catch (e) {
          out.textContent = e.message;
        }
      };
      panel.querySelector("#toolSupplyRun").onclick = run;
      run();
    }
  }

  window.PnpTools = {
    ids: Object.keys(tools),
    render(id, panel) {
      const fn = tools[id];
      if (!fn) {
        panel.innerHTML = toolShell("Tool not found", "", `<p class="muted">Unknown tool: ${esc(id)}</p>`);
        return;
      }
      panel.innerHTML = fn();
      bindToolHandlers(id, panel);
    },
  };
})();
