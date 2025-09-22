// ui.js
import { updateBalance } from "./balance.js";

function renderTrades(trades) {
  const tbody = document.querySelector("#trades-table tbody");
  tbody.innerHTML = "";

  trades.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.symbol}</td>
      <td>${t.type}</td>
      <td>${t.volume}</td>
      <td>${t.entry}</td>
      <td>${t.tp !== null ? `${t.tp} <button onclick="removeTP(${i})">❌</button>` : "-"}</td>
      <td>${t.sl !== null ? `${t.sl} <button onclick="removeSL(${i})">❌</button>` : "-"}</td>
      <td>${t.commission}</td>
      <td id="pnl-${i}">0</td>
      <td>
        <button onclick="openSettings(${i})">⚙️</button>
        <button onclick="closeTrade(${i})">❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  updateBalance(trades);
}

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

  notif.style.background = type === "error" ? "#b00020" : "#333";
  notif.style.color = "#fff";

  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 4000);
}

function disableTradeButtons() {
  document.querySelectorAll("button.trade-btn").forEach(btn => {
    btn.disabled = true;
  });
}

export { renderTrades, showNotification, disableTradeButtons };
