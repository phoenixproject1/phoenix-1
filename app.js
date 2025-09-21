function loadChart(symbol) {
  document.getElementById("tradingview_chart").innerHTML = "";
  new TradingView.widget({
    "container_id": "tradingview_chart",
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

document.addEventListener("DOMContentLoaded", () => {
  loadChart("BTCUSDT");

  // کلیک روی جدول → تغییر چارت
  document.querySelectorAll("#price-table tbody tr").forEach(row => {
    row.addEventListener("click", () => {
      const symbol = row.getAttribute("data-symbol");
      loadChart(symbol);
      document.querySelectorAll("#price-table tbody tr").forEach(r => r.style.background = "");
      row.style.background = "#e6f7ff";
    });
  });

  startWebSocket();
});

function startWebSocket() {
  const symbols = ["btcusdt", "ethusdt"];
  const streams = symbols.map(s => `${s}@ticker`).join('/');
  const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const data = msg.data;
    const sym = data.s;

    document.getElementById("bid-" + sym).textContent = parseFloat(data.b).toFixed(2);
    document.getElementById("ask-" + sym).textContent = parseFloat(data.a).toFixed(2);

    const changeCell = document.getElementById("change-" + sym);
    const change = parseFloat(data.P).toFixed(2);
    changeCell.textContent = change + "%";
    changeCell.className = change >= 0 ? "change-pos" : "change-neg";
  };

  ws.onerror = (err) => {
    console.error("WebSocket Error:", err);
  };
}
