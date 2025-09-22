// trade.js
import { config } from "./config.js";
import { updateBalance, getBalance } from "./balance.js";
import { renderTrades } from "./ui.js";
import { checkDrawdown } from "./drawdown.js";

let trades = [];
let selectedTradeIndex = null;

function openTrade(type, selectedSymbol) {
  const volume = parseFloat(document.getElementById("tradeVolume").value) || 0;
  const bid = parseFloat(document.getElementById("bid-" + selectedSymbol).textContent) || 0;
  const ask = parseFloat(document.getElementById("ask-" + selectedSymbol).textContent) || 0;
  const entry = type === "BUY" ? ask : bid;

  const commissionRate = config.commission / 100;
  const fee = entry * volume * commissionRate;

  let balance = getBalance();
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

  renderTrades(trades);
  checkDrawdown(balance, trades);
}

function closeTrade(i, reason = null) {
  const t = trades[i];
  const bid = parseFloat(document.getElementById("bid-" + t.symbol).textContent) || t.entry;
  const ask = parseFloat(document.getElementById("ask-" + t.symbol).textContent) || t.entry;
  const exitPrice = t.type === "BUY" ? bid : ask;

  const commissionRate = config.commission / 100;
  const exitFee = exitPrice * t.volume * commissionRate;

  let balance = getBalance();
  balance += (t.pnl - exitFee);

  if (reason) {
    showNotification(`معامله ${t.symbol} (${t.type}) با ${reason} بسته شد.`, "info");
  }

  trades.splice(i, 1);
  renderTrades(trades);
  checkDrawdown(balance, trades);
}

export { trades, openTrade, closeTrade, selectedTradeIndex };
