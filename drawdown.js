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

  if (!challengeFailed && (dailyDD >= config.dailyDD || totalDD >= config.totalDD)) {
    trades.length = 0; // همه معاملات بسته بشن
    challengeFailed = true;
    showNotification("❌ شما در این چالش مردود شدید !!!", "error");
  }

  // دکمه‌ها همیشه بررسی بشن
  const buyBtn = document.getElementById("buyBtn");
  const sellBtn = document.getElementById("sellBtn");
  if (buyBtn && sellBtn) {
    buyBtn.disabled = challengeFailed;
    sellBtn.disabled = challengeFailed;
  }
}
