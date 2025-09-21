let trades = [];
let balance = 10000;
const initialBalance = 10000;

const buyBtn = document.getElementById("buyBtn");
const sellBtn = document.getElementById("sellBtn");

buyBtn.addEventListener("click", () => {
  const volume = parseFloat(document.getElementById("trade-volume").value);
  const price = lastPrices[selectedSymbol]?.ask || 0;
  if (price > 0) addTrade(selectedSymbol, "BUY", price, volume);
});

sellBtn.addEventListener("click", () => {
  const volume = parseFloat(document.getElementById("trade-volume").value);
  const price = lastPrices[selectedSymbol]?.bid || 0;
  if (price > 0) addTrade(selectedSymbol, "SELL", price, volume);
});

function addTrade(symbol, type, entry, volume) {
  trades.push({ symbol, type, entry, volume, pnl: 0 });
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
      <td>${t.entry.toFixed(2)}</td>
      <td id="pnl-${i}">0.00</td>
    `;
    tbody.appendChild(row);
  });
}

function updatePNL() {
  trades.forEach((t, i) => {
    const bid = lastPrices[t.symbol]?.bid || t.entry;
    const ask = lastPrices[t.symbol]?.ask || t.entry;
    const price = t.type === "BUY" ? bid : ask;
    const pnl = (t.type === "BUY" ? (price - t.entry) : (t.entry - price)) * t.volume;
    t.pnl = pnl;

    const el = document.getElementById("pnl-" + i);
    if (el) {
      el.textContent = pnl.toFixed(2);
      el.className = pnl >= 0 ? "pnl-pos" : "pnl-neg";
    }
  });
  updateBalance();
}

function updateBalance() {
  let unrealized = 0;
  trades.forEach(t => unrealized += t.pnl);
  const equity = balance + unrealized;

  document.getElementById("realBalanceValue").textContent = balance.toFixed(2);
  document.getElementById("equityValue").textContent = equity.toFixed(2);
}

setInterval(updatePNL, 1000);
