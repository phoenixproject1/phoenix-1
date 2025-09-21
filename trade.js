let balance = 10000;
let equity = 10000;
const commissionRate = 0.001; // 0.1% مثل بایننس

function openTrade(symbol, type, volume, entryPrice) {
  const tableBody = document.querySelector("#trade-table tbody");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${symbol}</td>
    <td style="color:${type === "buy" ? "blue" : "red"}">${type.toUpperCase()}</td>
    <td>${volume}</td>
    <td>${entryPrice.toFixed(2)}</td>
    <td class="current-price">---</td>
    <td class="pnl">---</td>
    <td class="commission">---</td>
    <td><button class="close-btn">❌</button></td>
  `;
  tableBody.appendChild(row);

  const commission = entryPrice * volume * commissionRate;
  balance -= commission;
  updateBalance();

  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const price = parseFloat(data.c);
    row.querySelector(".current-price").textContent = price.toFixed(2);

    let pnl = (type === "buy") ? 
              (price - entryPrice) * volume : 
              (entryPrice - price) * volume;

    const totalCommission = commission + price * volume * commissionRate;
    row.querySelector(".commission").textContent = totalCommission.toFixed(2);

    pnl -= totalCommission;
    row.querySelector(".pnl").textContent = pnl.toFixed(2);
    row.querySelector(".pnl").style.color = pnl >= 0 ? "green" : "red";

    equity = balance + Array.from(document.querySelectorAll(".pnl"))
      .map(el => parseFloat(el.textContent) || 0)
      .reduce((a, b) => a + b, 0);
    updateBalance();
  };

  row.querySelector(".close-btn").addEventListener("click", () => {
    ws.close();
    row.remove();
    equity = balance + Array.from(document.querySelectorAll(".pnl"))
      .map(el => parseFloat(el.textContent) || 0)
      .reduce((a, b) => a + b, 0);
    updateBalance();
  });
}

function updateBalance() {
  document.getElementById("balance").textContent = balance.toFixed(2);
  document.getElementById("equity").textContent = equity.toFixed(2);
}

// تست اولیه
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    openTrade("BTCUSDT", "buy", 0.01, 50000);
  }, 2000);
});


function openConfig() {
  document.getElementById("configCommission").value = CONFIG.commission * 100;
  document.getElementById("configDailyLoss").value = CONFIG.dailyLossLimit;
  document.getElementById("configMaxDrawdown").value = CONFIG.maxDrawdown;
  document.getElementById("configModal").style.display = "flex";
}

function closeConfig() {
  document.getElementById("configModal").style.display = "none";
}

function saveConfig() {
  CONFIG.commission = parseFloat(document.getElementById("configCommission").value) / 100;
  CONFIG.dailyLossLimit = parseFloat(document.getElementById("configDailyLoss").value);
  CONFIG.maxDrawdown = parseFloat(document.getElementById("configMaxDrawdown").value);
  closeConfig();
  alert("تنظیمات ذخیره شد ✅");
}


let balance = CONFIG.initialBalance;
let equity = CONFIG.initialBalance;
const commissionRate = CONFIG.commission;



if ((balance - CONFIG.initialBalance) < CONFIG.dailyLossLimit) {
  alert("حد ضرر روزانه فعال شد! معاملات بسته می‌شوند.");
  // اینجا می‌تونی همه معاملات رو ببندی
}
