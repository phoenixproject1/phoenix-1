// trade.js
import { trades, balance, updateBalanceUI } from "./balance.js";
import { config } from "./config.js";
import { showNotification } from "./ui.js";
import { checkDrawdown, challengeFailed } from "./drawdown.js";

let selectedTradeIndex = null;

export function openTrade(type) {
  if (challengeFailed) {
    showNotification("شما در این چالش مردود شدید !!!", "error");
    return;
  }

  const volume = parseFloat(document.getElementById("tradeVolume").value) || 0;
  const bid = parseFloat(document.getElementById("bid-" + window.selectedSymbol).textContent) || 0;
  const ask = parseFloat(document.getElementById("ask-" + window.selectedSymbol).textContent) || 0;
  const entry = type === "BUY" ? ask : bid;

  const commissionRate = config.commission / 100;
  const fee = entry * volume * commissionRate;
  balance -= fee;

  trades.push({
    symbol: window.selectedSymbol,
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

export function renderTrades() {
  const tbody = document.querySelector("#trades-table tbody");
  tbody.innerHTML = "";
  trades.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.symbol}</td>
      <td>${t.type}</td>
      <td>${t.volume}</td>
      <td>${t.entry}</td>
      <td>
        ${t.tp !== null 
          ? `${t.tp} <button onclick="removeTP(${i})">❌</button>` 
          : "-"}
      </td>
      <td>
        ${t.sl !== null 
          ? `${t.sl} <button onclick="removeSL(${i})">❌</button>` 
          : "-"}
      </td>
      <td>${t.commission}</td>
      <td id="pnl-${i}">0</td>
      <td>
        <button onclick="openSettings(${i})">⚙️</button>
        <button onclick="closeTrade(${i})">❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateBalance();
}

export function closeTrade(i, reason = null) {
  const t = trades[i];
  const bid = parseFloat(document.getElementById("bid-" + t.symbol).textContent) || t.entry;
  const ask = parseFloat(document.getElementById("ask-" + t.symbol).textContent) || t.entry;
  const exitPrice = t.type === "BUY" ? bid : ask;

  const commissionRate = config.commission / 100;
  const exitFee = exitPrice * t.volume * commissionRate;

  balance += (t.pnl - exitFee);

  if (reason) {
    showNotification(`معامله ${t.symbol} (${t.type}) با ${reason} بسته شد.`, "info");
  }

  trades.splice(i, 1);
  renderTrades();
}

window.removeTP = (i) => { trades[i].tp = null; renderTrades(); };
window.removeSL = (i) => { trades[i].sl = null; renderTrades(); };

export function updateBalance() {
  let unrealized = 0;
  trades.forEach((t, i) => {
    const bid = parseFloat(document.getElementById("bid-" + t.symbol).textContent) || t.entry;
    const ask = parseFloat(document.getElementById("ask-" + t.symbol).textContent) || t.entry;
    const price = t.type === "BUY" ? bid : ask;

    t.pnl = (t.type === "BUY" ? (price - t.entry) : (t.entry - price)) * t.volume;

    const el = document.getElementById("pnl-" + i);
    if (el) el.textContent = t.pnl.toFixed(2);

    if (t.tp !== null) {
      if ((t.type === "BUY" && price >= t.tp) || (t.type === "SELL" && price <= t.tp)) {
        closeTrade(i, "حد سود (TP)");
        return;
      }
    }
    if (t.sl !== null) {
      if ((t.type === "BUY" && price <= t.sl) || (t.type === "SELL" && price >= t.sl)) {
        closeTrade(i, "حد ضرر (SL)");
        return;
      }
    }

    unrealized += t.pnl;
  });

  updateBalanceUI(unrealized);
  checkDrawdown();
}

setInterval(updateBalance, 2000);

window.openTrade = openTrade;
window.closeTrade = closeTrade;
window.openSettings = (i) => { selectedTradeIndex = i; document.getElementById("settingsModal").style.display = "flex"; };
window.closeSettings = () => { document.getElementById("settingsModal").style.display = "none"; };
window.saveSettings = () => {
  const tp = parseFloat(document.getElementById("tpInput").value);
  const sl = parseFloat(document.getElementById("slInput").value);
  if (selectedTradeIndex !== null && trades[selectedTradeIndex]) {
    if (!isNaN(tp)) trades[selectedTradeIndex].tp = tp;
    if (!isNaN(sl)) trades[selectedTradeIndex].sl = sl;
  }
  renderTrades();
  window.closeSettings();
};
