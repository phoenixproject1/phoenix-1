// trade.js (با مانیتورینگ Drawdown + نوتیفیکیشن)
let trades = [];
let balance = 10000;
let selectedTradeIndex = null;

let peakBalanceAllTime = balance;
let peakBalanceToday = balance;
let todayDate = new Date().toDateString();
let challengeFailed = false; // جلوگیری از ادامه بعد از شکست

function openTrade(type) {
  if (challengeFailed) {
    showNotification("❌ شما در این چالش مردود شدید. معامله جدید مجاز نیست.", "error");
    return;
  }

  const volume = parseFloat(document.getElementById("tradeVolume").value) || 0;
  const bid = parseFloat(document.getElementById("bid-" + selectedSymbol).textContent) || 0;
  const ask = parseFloat(document.getElementById("ask-" + selectedSymbol).textContent) || 0;
  const entry = type === "BUY" ? ask : bid;

  const commissionRate = config.commission / 100;
  const fee = entry * volume * commissionRate;
  balance -= fee; // کمیسیون ورود

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
  if (challengeFailed) return;

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

function removeTP(i) {
  trades[i].tp = null;
  renderTrades();
}

function removeSL(i) {
  trades[i].sl = null;
  renderTrades();
}

function updateBalance() {
  if (challengeFailed) return;

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

  checkDrawdown(balance + unrealized);
}

setInterval(updateBalance, 2000);

// ========== مانیتورینگ افت سرمایه ==========
function checkDrawdown(equity) {
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

    const reason = dailyDD >= config.dailyDD ? "❌ حد ضرر روزانه فعال شد!" : "❌ حد ضرر کلی فعال شد!";
    showNotification(reason + " همه معاملات بسته شدند.", "error");

    document.getElementById("buyBtn").disabled = true;
    document.getElementById("sellBtn").disabled = true;
  }
}

// ========== نوتیفیکیشن ==========
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

  if (type === "error") {
    notif.style.background = "#b00020";
    notif.style.color = "#fff";
  } else {
    notif.style.background = "#333";
    notif.style.color = "#fff";
  }

  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 5000);
}
