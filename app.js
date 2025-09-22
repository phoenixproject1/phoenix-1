let selectedSymbol = "BTCUSDT";

// لود چارت
function loadChart(symbol) {
  document.getElementById("chart").innerHTML = "";
  new TradingView.widget({
    "container_id": "chart",
    "width": "100%",
    "height": "600",
    "symbol": "BINANCE:" + symbol,
    "interval": "60",
    "timezone": "Etc/UTC",
    "theme": "light",
    "style": "1",
    "locale": "fa",
    "enable_publishing": false,
    "allow_symbol_change": false,
  });
}

// آپدیت قیمت‌ها با WebSocket
function connectPrices() {
  const symbols = ["btcusdt", "ethusdt"];
  symbols.forEach(sym => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym}@ticker`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const tbody = document.querySelector("#price-table tbody");
      let row = document.querySelector(`tr[data-symbol="${sym.toUpperCase()}"]`);
      if (!row) {
        row = document.createElement("tr");
        row.setAttribute("data-symbol", sym.toUpperCase());
        row.innerHTML = `
          <td>${sym.toUpperCase()}</td>
          <td id="bid-${sym.toUpperCase()}">-</td>
          <td id="ask-${sym.toUpperCase()}">-</td>
          <td id="change-${sym.toUpperCase()}">-</td>
        `;
        row.addEventListener("click", () => {
          selectedSymbol = sym.toUpperCase();
          loadChart(selectedSymbol);
        });
        tbody.appendChild(row);
      }
      document.getElementById("bid-" + sym.toUpperCase()).textContent = parseFloat(data.b).toFixed(2);
      document.getElementById("ask-" + sym.toUpperCase()).textContent = parseFloat(data.a).toFixed(2);
      document.getElementById("change-" + sym.toUpperCase()).textContent = parseFloat(data.P).toFixed(2) + "%";
    };
  });
}

// استارت
document.addEventListener("DOMContentLoaded", () => {
  loadChart(selectedSymbol);
  connectPrices();
});
