// تنظیمات پیش‌فرض
let config = {
  commission: 0.1,   // درصد
  dailyDD: 5,        // درصد
  totalDD: 20        // درصد
};

function openSettings() {
  document.getElementById("commissionInput").value = config.commission;
  document.getElementById("dailyDDInput").value = config.dailyDD;
  document.getElementById("totalDDInput").value = config.totalDD;
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
  config.commission = parseFloat(document.getElementById("commissionInput").value);
  config.dailyDD = parseFloat(document.getElementById("dailyDDInput").value);
  config.totalDD = parseFloat(document.getElementById("totalDDInput").value);
  closeSettings();
}
