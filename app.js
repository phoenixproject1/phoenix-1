let selectedSymbol = "BTCUSDT";
let chart;
let chartData = [];


let selectedSymbol = "BTCUSDT"; // نماد پیشفرض
let lastPrices = {}; // ذخیره آخرین قیمت‌ها
// لیست نمادهای برتر
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "SOLUSDT"];



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
  loadChart(selectedSymbol);

  const table = document.getElementById("price-table");
  table.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-symbol]");
    if (row) {
      selectedSymbol = row.getAttribute("data-symbol");
      [...table.querySelectorAll("tr")].forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
      loadChart(selectedSymbol);
    }
  });

  connectWS();
});

function connectWS() {
  const streams = ["btcusdt@bookTicker", "ethusdt@bookTicker"];
  const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=" + streams.join("/"));

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data).data;
    const symbol = data.s;
    const bid = parseFloat(data.b);
    const ask = parseFloat(data.a);

    lastPrices[symbol] = { bid, ask };

    const bidEl = document.getElementById("bid-" + symbol);
    const askEl = document.getElementById("ask-" + symbol);
    if (bidEl) bidEl.textContent = bid.toFixed(2);
    if (askEl) askEl.textContent = ask.toFixed(2);
  };
}
