let trades = [];
let balance = 10000;
let selectedTradeIndex = null; // برای مشخص کردن ترید انتخاب شده

function openTrade(type) {
  const volume = parseFloat(document.getElementById("tradeVolume").value);
  const bid = parseFloat(document.getElementById("bid-" + selectedSymbol).textContent);
  const ask = parseFloat(document.getElementById("ask-" + selectedSymbol).textContent);
  const entry = type === "BUY" ? ask : bid;

  const commission = config.commission / 100;
  const fee = entry * volume * commission;
  balance -= fee;

  trades.push({
    symbol: selectedSymbol,
    type,
    volume,
    entry,
    commission: fee.toFixed(2),
    tp: null,
    sl: null,
    pnl: 0
  });
  renderTrades();
}

function renderTrades() {
  const tbody = document.querySelector("#trades-table tbody");
  tbody.innerHTML = "";
  trades.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.symbol}</td>
      <td>${t.type}</td>
      <td>${t.volume}</td>
      <td>${t.entry}</td>
      <td>${t.commission}</td>
      <td id="pnl-${i}">0</td>
      <td>${t.tp !== null ? t.tp : "-"}</td>
      <td>${t.sl !== null ? t.sl : "-"}</td>
      <td>
        <button onclick="openSettings(${i})">⚙️</button>
        <button onclick="closeTrade(${i})">❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateBalance();
}

function closeTrade(i) {
  balance += trades[i].pnl;
  trades.splice(i,1);
  renderTrades();
}

function updateBalance() {
  let unrealized = 0;
  trades.forEach((t, i) => {
    const bid = parseFloat(document.getElementById("bid-" + t.symbol).textContent) || t.entry;
    const ask = parseFloat(document.getElementById("ask-" + t.symbol).textContent) || t.entry;
    const price = t.type === "BUY" ? bid : ask;
    t.pnl = (t.type === "BUY" ? (price - t.entry) : (t.entry - price)) * t.volume;

    const el = document.getElementById("pnl-" + i);
    if (el) el.textContent = t.pnl.toFixed(2);

    unrealized += t.pnl;
  });
  document.getElementById("balance").textContent = balance.toFixed(2);
  document.getElementById("equity").textContent = (balance + unrealized).toFixed(2);
}

setInterval(updateBalance, 2000);

// ================= Modal برای TP/SL =================

function openSettings(index) {
  selectedTradeIndex = index;
  document.getElementById("tpInput").value = trades[index].tp || "";
  document.getElementById("slInput").value = trades[index].sl || "";
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
  selectedTradeIndex = null;
}

function saveSettings() {
  const tp = document.getElementById("tpInput").value;
  const sl = document.getElementById("slInput").value;

  if (selectedTradeIndex !== null) {
    trades[selectedTradeIndex].tp = tp ? parseFloat(tp) : null;
    trades[selectedTradeIndex].sl = sl ? parseFloat(sl) : null;
  }
  closeSettings();
  renderTrades();
}
