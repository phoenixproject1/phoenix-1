// تنظیمات اصلی
const CONFIG = {
  commission: 0.001,          // کمیسیون 0.1%
  dailyLossPercent: 5,        // حد ضرر روزانه (%)
  maxDrawdownPercent: 10,     // حد ضرر کلی (%)
  initialBalance: 10000,      // موجودی اولیه
  symbols: ["BTCUSDT","ETHUSDT"]
};

// تبدیل درصد به مقدار واقعی (USDT)
function getDailyLossLimit() {
  return -(CONFIG.initialBalance * CONFIG.dailyLossPercent / 100);
}
function getMaxDrawdownLimit() {
  return -(CONFIG.initialBalance * CONFIG.maxDrawdownPercent / 100);
}

// کنترل Modal
function openConfig() {
  document.getElementById("configCommission").value = CONFIG.commission * 100;
  document.getElementById("configDailyLoss").value = CONFIG.dailyLossPercent;
  document.getElementById("configMaxDrawdown").value = CONFIG.maxDrawdownPercent;
  document.getElementById("configModal").style.display = "flex";
}
function closeConfig() {
  document.getElementById("configModal").style.display = "none";
}
function saveConfig() {
  CONFIG.commission = parseFloat(document.getElementById("configCommission").value) / 100;
  CONFIG.dailyLossPercent = parseFloat(document.getElementById("configDailyLoss").value);
  CONFIG.maxDrawdownPercent = parseFloat(document.getElementById("configMaxDrawdown").value);
  closeConfig();
  alert("✅ تنظیمات ذخیره شد");
}
