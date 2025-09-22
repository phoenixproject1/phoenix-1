// drawdown.js
import { trades, balance } from "./balance.js";
import { config } from "./config.js";
import { showNotification } from "./ui.js";

let peakBalanceAllTime = balance;
let peakBalanceToday = balance;
let todayDate = new Date().toDateString();
export let challengeFailed = false;

export function checkDrawdown() {
  const equity = balance + trades.reduce((acc, t) => acc + t.pnl, 0);

  const nowDate = new Date().toDateString();
  if (nowDate !== todayDate) {
    todayDate = nowDate;
    peakBalanceToday = equity;
  }

  if (equity > peakBalanceAllTime) peakBalanceAllTime = equity;
  if (equity > peakBalanceToday) peakBalanceToday = equity;

  const dailyDD = ((peakBalanceToday - equity) / peakBalanceToday) * 100;
  const totalDD = ((peakBalanceAllTime - equity) / peakBalanceAllTime) * 100;

  if (dailyDD >= config.dailyDD || totalDD >= config.totalDD) {
    trades.length = 0;
    challengeFailed = true;
    showNotification("❌ شما در این چالش مردود شدید !!!", "error");

    document.getElementById("buyBtn").disabled = true;
    document.getElementById("sellBtn").disabled = true;
  }
}
