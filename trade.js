// trade.js (اصلاح‌شده — افت سرمایه + نوتیفیکیشن + جلوگیری از کم شدن کمیسیون بعد از شکست)
let trades = [];
let balance = 10000;
let selectedTradeIndex = null;
let challengeFailed = false;   // ✅ پرچم پایان چالش

function openTrade(type) {
  if (challengeFailed) {
    showNotification("❌ شما در این چالش مردود شدید. امکان باز کردن معامله جدید وجود ندارد.", "error");
    return; // ⛔ جلوگیری کامل از باز شدن معامله و کم شدن کمیسیون
  }

  const volume = parseFloat(document.getElementById("tradeVolume").value) || 0;
  const bid = parseFloat(document.getElementById("bid-" + selectedSymbol).textContent) || 0;
  const ask = parseFloat(document.getElementById("ask-" + selectedSymbol).textContent) || 0;
  const entry = type === "BUY" ? ask : bid;

  const commissionRate = config.commission / 100;
  const fee = entry * volume * commissionRate;
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
        <button onclick="openSettings(${i})" ${challengeFailed ? "disabled" : ""}>⚙️</button>
        <button onclick="closeTrade(${i})" ${challengeFailed ? "disabled" : ""}>❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateBalance();
}

function closeTrade(i, reason = null) {
  if (challengeFailed) return; // ⛔ بعد از شکست، معامله دستی هم بسته نشه

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

// حذف دستی TP
function removeTP(i) {
  trades[i].tp = null;
  renderTrades();
}

// حذف دستی SL
function removeSL(i) {
  trades[i].sl = null;
  renderTrades();
}

function updateBalance() {
  if (challengeFailed) return; // ✅ بعد از شکست دیگه محاسبه نشه

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

  document.getElementById("balance").textContent = balance.toFixed(2);
  document.getElementById("equity").textContent = (balance + unrealized).toFixed(2);

  checkDrawdown();
}

setInterval(updateBalance, 2000);

// ================= Modal برای TP/SL =================
function openSettings(i) {
  if (challengeFailed) return;
  selectedTradeIndex = i;
  const t = trades[i];
  document.getElementById("tpInput").value = t.tp !== null ? t.tp : "";
  document.getElementById("slInput").value = t.sl !== null ? t.sl : "";
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
  selectedTradeIndex = null;
}

function saveSettings() {
  if (challengeFailed) return;
  const tp = parseFloat(document.getElementById("tpInput").value);
  const sl = parseFloat(document.getElementById("slInput").value);

  if (selectedTradeIndex !== null) {
    if (!isNaN(tp)) trades[selectedTradeIndex].tp = tp;
    if (!isNaN(sl)) trades[selectedTradeIndex].sl = sl;
  }

  closeSettings();
  renderTrades();
}

// ================= نوتیفیکیشن ساده =================
function showNotification(msg, type = "info") {
  const notif = document.createElement("div");
  notif.textContent = msg;
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.right = "20px";
  notif.style.padding = "10px 15px";
  notif.style.borderRadius = "8px";
  notif.style.zIndex = "9999";
  notif.style.opacity = "0.95";
  notif.style.fontSize = "14px";
  notif.style.maxWidth = "300px";

  if (type === "error") {
    notif.style.background = "#b00020";
    notif.style.color = "#fff";
  } else {
    notif.style.background = "#333";
    notif.style.color = "#fff";
  }

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 5000);
}

// ===== مانیتورینگ افت سرمایه =====
let peakBalanceAllTime = balance;
let peakBalanceToday = balance;
let todayDate = new Date().toDateString();

function checkDrawdown() {
  if (challengeFailed) return;

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
    trades = [];
    renderTrades();

    challengeFailed = true;

    const reason = dailyDD >= config.dailyDD ? "❌ حداکثر افت روزانه رسید!" : "❌ حداکثر افت کلی رسید!";
    showNotification(reason + " همه معاملات بسته شدند.", "error");

    document.getElementById("buyBtn").disabled = true;
    document.getElementById("sellBtn").disabled = true;
  }
}
