// تنظیمات پیش‌فرض
let config = {
  commission: 0.1,   // درصد
  dailyDD: 5,        // درصد
  totalDD: 20        // درصد
};

function openConfigSettings() {
  document.getElementById("commissionInput").value = config.commission;
  document.getElementById("dailyDDInput").value = config.dailyDD;
  document.getElementById("totalDDInput").value = config.totalDD;
  document.getElementById("configModal").style.display = "flex";
}

function closeConfigSettings() {
  document.getElementById("configModal").style.display = "none";
}

function saveConfigSettings() {
  config.commission = parseFloat(document.getElementById("commissionInput").value);
  config.dailyDD = parseFloat(document.getElementById("dailyDDInput").value);
  config.totalDD = parseFloat(document.getElementById("totalDDInput").value);
  closeConfigSettings();
}
