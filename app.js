let latestPrices = {};
let selectedRow = null;

function connectSocket() {
  const symbols = ["btcusdt", "ethusdt"];
  const streams = symbols.map(s => `${s}@bookTicker`).join("/");
  const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const data = msg.data;
    const symbol = data.s;

    latestPrices[symbol] = {
      bid: parseFloat(data.b),
      ask: parseFloat(data.a)
    };

    // آپدیت جدول قیمت
    if (document.getElementById("bid-" + symbol)) {
      document.getElementById("bid-" + symbol).textContent = latestPrices[symbol].bid.toFixed(2);
      document.getElementById("ask-" + symbol).textContent = latestPrices[symbol].ask.toFixed(2);
    }

    // اگر trade.js لود شده باشه، PNL هم آپدیت بشه
    if (typeof updatePNL === "function") {
      updatePNL(latestPrices);
    }
  };
}

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
    "allow_symbol_change": false
  });
}

document.addEventListener("DOMContentLoaded", () => {
  connectSocket();
  loadChart("BTCUSDT");

  // کلیک روی سطر جدول قیمت
  document.querySelectorAll("#price-table tbody tr").forEach(row => {
    row.addEventListener("click", () => {
      if (selectedRow) selectedRow.classList.remove("selected-row");
      row.classList.add("selected-row");
      selectedRow = row;
      const symbol = row.dataset.symbol;
      loadChart(symbol);
    });
  });
});
