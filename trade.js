// trade.js (ماژول معاملات + اتصال به window برای دکمه‌ها)

// trade.js
import { config } from "./config.js";
import { checkDrawdown } from "./drawdown.js";
// import { showNotification } from "./ui.js";  // اگه notification رو ببری تو ui.js

let trades = [];
let balance = 10000;
let selectedTradeIndex = null; // برای مشخص کردن ترید انتخاب شده

function openTrade(type) {
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
  checkDrawdown();   // اضافه شد

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
  checkDrawdown();   // اضافه شد

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
  checkDrawdown();   // اضافه شد

}

setInterval(updateBalance, 2000);

// ================= Modal برای TP/SL =================
function openSettings(index) {
  selectedTradeIndex = index;
  clearModalError();

  document.getElementById("tpInput").value = trades[index].tp != null ? trades[index].tp : "";
  document.getElementById("slInput").value = trades[index].sl != null ? trades[index].sl : "";
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
  selectedTradeIndex = null;
}

function saveSettings() {
  const tpRaw = document.getElementById("tpInput").value;
  const slRaw = document.getElementById("slInput").value;

  if (selectedTradeIndex === null) return;

  const trade = trades[selectedTradeIndex];
  const tpVal = tpRaw === "" ? null : parseFloat(tpRaw);
  const slVal = slRaw === "" ? null : parseFloat(slRaw);

  if (tpVal !== null && isNaN(tpVal)) {
    setModalError("مقدار حد سود (TP) معتبر نیست.");
    return;
  }
  if (slVal !== null && isNaN(slVal)) {
    setModalError("مقدار حد ضرر (SL) معتبر نیست.");
    return;
  }

  if (trade.type === "BUY") {
    if (tpVal !== null && tpVal <= trade.entry) {
      setModalError("در معامله BUY، TP باید بزرگتر از قیمت ورود باشد.");
      return;
    }
    if (slVal !== null && slVal >= trade.entry) {
      setModalError("در معامله BUY، SL باید کوچکتر از قیمت ورود باشد.");
      return;
    }
  } else {
    if (tpVal !== null && tpVal >= trade.entry) {
      setModalError("در معامله SELL، TP باید کوچکتر از قیمت ورود باشد.");
      return;
    }
    if (slVal !== null && slVal <= trade.entry) {
      setModalError("در معامله SELL، SL باید بزرگتر از قیمت ورود باشد.");
      return;
    }
  }

  trade.tp = tpVal;
  trade.sl = slVal;

  clearModalError();
  closeSettings();
  renderTrades();
}

function setModalError(msg) {
  let modal = document.getElementById("settingsModal");
  if (!modal) return;
  let err = modal.querySelector("#settingsError");
  if (!err) {
    err = document.createElement("div");
    err.id = "settingsError";
    err.style.color = "red";
    err.style.marginTop = "8px";
    modal.querySelector(".modal-content")?.appendChild(err) || modal.appendChild(err);
  }
  err.textContent = msg;
}

function clearModalError() {
  const modal = document.getElementById("settingsModal");
  if (!modal) return;
  const err = modal.querySelector("#settingsError");
  if (err) err.remove();
}

// ================= Notification =================
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

  setTimeout(() => {
    notif.remove();
  }, 4000);
}

// ================= اتصال به window برای HTML =================
window.openTrade = openTrade;
window.closeTrade = closeTrade;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.removeTP = removeTP;
window.removeSL = removeSL;


checkDrawdown();
