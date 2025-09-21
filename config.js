// فایل تنظیمات اصلی ترید
const CONFIG = {
  commission: 0.001,         // کمیسیون 0.1% (مثل بایننس)
  dailyLossPercent: 2,       // حد ضرر روزانه 2% از بالانس
  maxDrawdownPercent: 10,    // حد ضرر کلی 10% از بالانس
  initialBalance: 10000,     // موجودی اولیه
  symbols: ["BTCUSDT", "ETHUSDT"], // لیست جفت‌ارزها
};

// توابع محاسبه حد ضرر به صورت عددی (USDT)
function getDailyLossLimit() {
  return -(CONFIG.initialBalance * CONFIG.dailyLossPercent / 100);
}

function getMaxDrawdownLimit() {
  return -(CONFIG.initialBalance * CONFIG.maxDrawdownPercent / 100);
}
