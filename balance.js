// balance.js
import { config } from "./config.js";
import { closeTrade } from "./trade.js";

let balance = config.initialBalance;

function updateBalance(trades) {
  let unrealized = 0;

  trades.forEach((t, i) => {
    const bid = parseFloat(document.getElementById("bid-" + t.symbol).textContent) || t.entry;
    const ask = parseFloat(document.getElementById("ask-" + t.symbol).textContent) || t.entry;
    const price = t.type === "BUY" ? bid : ask;

    t.pnl = (t.type === "BUY" ? (price - t.entry) : (t.entry - price)) * t.volume;

    const el = document.getElementById("pnl-" + i);
    if (el) el.textContent = t.pnl.toFixed(2);

    if (t.tp !== null && ((t.type === "BUY" && price >= t.tp) || (t.type === "SELL" && price <= t.tp))) {
      closeTrade(i, "حد سود (TP)");
      return;
    }

    if (t.sl !== null && ((t.type === "BUY" && price <= t.sl) || (t.type === "SELL" && price >= t.sl))) {
      closeTrade(i, "حد ضرر (SL)");
      return;
    }

    unrealized += t.pnl;
  });

  document.getElementById("balance").textContent = balance.toFixed(2);
  document.getElementById("equity").textContent = (balance + unrealized).toFixed(2);
}

function getBalance() {
  return balance;
}

export { updateBalance, getBalance };
