let balance = 10000;
let initialBalance = 10000;
let trades = [];

// باز کردن معامله
function openTrade(type) {
  const price = chart.data.datasets[0].data.slice(-1)[0]; // آخرین قیمت چارت
  if (!price) {
    alert("قیمت موجود نیست");
    return;
  }

  const volume = 1; // فعلاً ثابت
  const commission = price * volume * (config.commission / 100);

  const trade = {
    symbol: selectedSymbol,
    type,
    volume,
    entry: price,
    commission,
    pnl: 0
  };

  trades.push(trade);
  renderTrades();
}

// بستن معامله
function closeTrade(index) {
  trades.splice(index, 1);
  renderTrades();
}

// بروزرسانی سود/ضرر
function updateTrades(currentPrice) {
  trades.forEach(trade => {
    if (trade.type === "BUY") {
      trade.pnl = (currentPrice - trade.entry) * trade.volume - trade.commission;
    } else {
      trade.pnl = (trade.entry - currentPrice) * trade.volume - trade.commission;
    }
  });
  renderTrades();
}

// نمایش جدول معاملات
function renderTrades() {
  const tbody = document.querySelector("#tradesTable tbody");
  tbody.innerHTML = "";

  let equity = balance;

  trades.forEach((trade, i) => {
    equity += trade.pnl;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trade.symbol}</td>
      <td style="color:${trade.type === "BUY" ? "blue" : "red"}">${trade.type}</td>
      <td>${trade.volume}</td>
      <td>${trade.entry.toFixed(2)}</td>
      <td>${chart.data.datasets[0].data.slice(-1)[0]?.toFixed(2) || "---"}</td>
      <td style="color:${trade.pnl >= 0 ? "blue" : "red"}">${trade.pnl.toFixed(2)}</td>
      <td>${trade.commission.toFixed(2)}</td>
      <td><button onclick="closeTrade(${i})">بستن</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("balanceRow").textContent =
    `Balance: ${balance.toFixed(2)} | Equity: ${equity.toFixed(2)}`;

  // بررسی حد ضرر روزانه و کلی
  const dailyLoss = ((initialBalance - equity) / initialBalance) * 100;
  if (dailyLoss >= config.dailyDrawdown) {
    alert("❌ حد ضرر روزانه رد شده است.");
  }
  if (dailyLoss >= config.totalDrawdown) {
    alert("❌ حد ضرر کلی رد شده است.");
  }
}
