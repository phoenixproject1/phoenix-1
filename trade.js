// trade.js (اصلاح شده — اعتبارسنجی TP/SL + خطای داخل modal)
let trades = [];
let balance = 10000;
let selectedTradeIndex = null; // برای مشخص کردن ترید انتخاب شده
let challengeFailed = false;   // ✅ پرچم پایان چالش

function openTrade(type) {
  if (challengeFailed) {
    showNotification("شما در این چالش مردود شدید !!!", "error");
    return; // ✅ جلوگیری از باز شدن معامله جدید
  }

  const volume = parseFloat(document.getElementById("tradeVolume").value) || 0;
  const bid = parseFloat(document.getElementById("bid-" + selectedSymbol).textContent) || 0;
  const ask = parseFloat(document.getElementById("ask-" + selectedSymbol).textContent) || 0;
  const entry = type === "BUY" ? ask : bid;

  const commissionRate = config.commission / 100;
  const fee = entry * volume * commissionRate;
  balance -= fee; // کمیسیون ورود کم میشه

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
        <button onclick="openSettings(${i})">⚙️</button>
        <button onclick="closeTrade(${i})">❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateBalance();
}

function closeTrade(i, reason = null) {
  const t = trades[i];
  const bid = parseFloat(document.getElementById("bid-" + t.symbol).textContent) || t.entry;
  const ask = parseFloat(document.getElementById("ask-" + t.symbol).textContent) || t.entry;
  const exitPrice = t.type === "BUY" ? bid : ask;

  // کمیسیون خروج
  const commissionRate = config.commission / 100;
  const exitFee = exitPrice * t.volume * commissionRate;

  balance += (t.pnl - exitFee); // سود/ضرر نهایی بعد از کسر کمیسیون خروج

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

// ===== مانیتورینگ افت سرمایه =====
let peakBalanceAllTime = balance;
let peakBalanceToday = balance;
let todayDate = new Date().toDateString();

function checkDrawdown() {
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
    // ✅ بستن همه معاملات با دلیل
    const toClose = [...trades.keys()];
    toClose.forEach(() => closeTrade(0, dailyDD >= config.dailyDD ? "حد ضرر روزانه" : "حد ضرر کلی"));

    challengeFailed = true;
    showNotification("❌ شما در این چالش مردود شدید !!!", "error");
    renderTrades();

    document.getElementById("buyBtn").disabled = true;
    document.getElementById("sellBtn").disabled = true;
  }
}
