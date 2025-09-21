// تنظیمات پیش‌فرض
let config = {
  commission: 0.1,       // درصد کمیسیون
  dailyDrawdown: 5,      // درصد از بالانس
  totalDrawdown: 10      // درصد از بالانس اولیه
};

// تابع باز کردن modal
function openSettings() {
  document.getElementById("settingsModal").style.display = "block";
  document.getElementById("commissionInput").value = config.commission;
  document.getElementById("dailyInput").value = config.dailyDrawdown;
  document.getElementById("totalInput").value = config.totalDrawdown;
}

// تابع ذخیره تنظیمات
function saveSettings() {
  config.commission = parseFloat(document.getElementById("commissionInput").value);
  config.dailyDrawdown = parseFloat(document.getElementById("dailyInput").value);
  config.totalDrawdown = parseFloat(document.getElementById("totalInput").value);
  alert("✅ تنظیمات ذخیره شد");
  closeSettings();
}

// بستن modal
function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}
