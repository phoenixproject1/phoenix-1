// drawdown.js
import { config } from "./config.js";
import { trades, closeTrade } from "./trade.js";
import { showNotification, disableTradeButtons } from "./ui.js";

let dailyLoss = 0;

function checkDrawdown(balance, trades) {
  const currentEquity = parseFloat(document.getElementById("equity").textContent);

  const dailyLimit = (config.dailyDD / 100) * config.initialBalance;
  const totalLimit = (config.totalDD / 100) * config.initialBalance;

  dailyLoss = config.initialBalance - currentEquity;

  if (dailyLoss >= dailyLimit) {
    trades.slice().forEach((_, i) => closeTrade(i, "حد ضرر روزانه"));
    showNotification("به حد ضرر روزانه رسیدی. معاملات بسته شدند.", "error");
    disableTradeButtons();
  }

  if (config.initialBalance - currentEquity >= totalLimit) {
    trades.slice().forEach((_, i) => closeTrade(i, "حد ضرر کلی"));
    showNotification("به حد ضرر کلی رسیدی. معاملات بسته شدند.", "error");
    disableTradeButtons();
  }
}

export { checkDrawdown };
