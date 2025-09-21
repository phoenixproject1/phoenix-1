let trades = [];
let initialBalance = 10000;
let balance = 10000;

function openTrade(type) {
  const volume = parseFloat(document.getElementById("tradeVolume").value);
  const commission = parseFloat(document.getElementById("commission").value) / 100;
  const symbol = document.querySelector("#price-table .selected-row")?.dataset.symbol || "BTCUSDT";

  const price = type === "BUY"
    ? latestPrices[symbol].ask
    : latestPrices[symbol].bid;

  const fee = price * volume * commission;
  balance -= fee;

  trades.push({
    symbol,
    type,
    volume,
    entry: price,
    tp: null,
    sl: null,
    ts: null,
    trailActive: null,
    pnl: 0
  });

  renderTrades();
  updateBalance();
}

function renderTrades() {
  const tbody = document.querySelector("#trades-table tbody");
  tbody.innerHTML = "";
  trades.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.symbol}</td>
      <td style="color:${t.type==="BUY"?"blue":"red"}">${t.type}</td>
      <td>${t.volume}</td>
      <td>${t.entry.toFixed(2)}</td>
      <td id="pnl-${i}">0.00</td>
      <td><button onclick="closeTrade(${i})">❌</button></td>
    `;
    tbody.appendChild(row);
  });
}

function updatePNL(prices) {
  trades.forEach((t, i) => {
    const bid = prices[t.symbol]?.bid || t.entry;
    const ask = prices[t.symbol]?.ask || t.entry;
    const price = t.type === "BUY" ? bid : ask;
    let pnl = (t.type === "BUY" ? (price - t.entry) : (t.entry - price)) * t.volume;
    t.pnl = pnl;

    const el = document.getElementById("pnl-" + i);
    if (el) {
      el.textContent = pnl.toFixed(2);
      el.className = pnl >= 0 ? "pnl-pos" : "pnl-neg";
    }
  });
  updateBalance();
}

function closeTrade(i) {
  balance += trades[i].pnl;
  trades.splice(i, 1);
  renderTrades();
  updateBalance();
}

function updateBalance() {
  let unrealized = 0;
  trades.forEach(t => unrealized += t.pnl);
  const equity = balance + unrealized;

  document.getElementById("realBalanceValue").textContent = balance.toFixed(2);
  document.getElementById("equityValue").textContent = equity.toFixed(2);
}
