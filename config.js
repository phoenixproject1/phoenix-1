// config.js
export let config = {
  commission: 0.1, // درصد کمیسیون
  dailyDD: 5,      // حداکثر افت روزانه (%)
  totalDD: 10      // حداکثر افت کلی (%)
};

export function openConfigSettings() {
  document.getElementById("commissionInput").value = config.commission;
  document.getElementById("dailyDDInput").value = config.dailyDD;
  document.getElementById("totalDDInput").value = config.totalDD;
  document.getElementById("configModal").style.display = "flex";
}

export function closeConfigSettings() {
  document.getElementById("configModal").style.display = "none";
}

export function saveConfigSettings() {
  config.commission = parseFloat(document.getElementById("commissionInput").value) || config.commission;
  config.dailyDD = parseFloat(document.getElementById("dailyDDInput").value) || config.dailyDD;
  config.totalDD = parseFloat(document.getElementById("totalDDInput").value) || config.totalDD;
  closeConfigSettings();
}

// 👉 وصل کردن به window برای استفاده در HTML
window.openConfigSettings = openConfigSettings;
window.closeConfigSettings = closeConfigSettings;
window.saveConfigSettings = saveConfigSettings;
