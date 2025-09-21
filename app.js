let selectedRow = null;

function loadChart(symbol) {
  document.getElementById("tradingview_chart").innerHTML = "";
  new TradingView.widget({
    container_id: "tradingview_chart",
    width: "100%",
    height: "600",
    symbol: "BINANCE:" + symbol,
    interval: "60",
    timezone: "Etc/UTC",
    theme: "light",
    style: "1",
    locale: "fa",
    enable_publishing: false,
    allow_symbol_change: false
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const symbols = ["BTCUSDT", "ETHUSDT"];
  loadChart("BTCUSDT");

  symbols.forEach(sym => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym.toLowerCase()}@ticker`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      document.getElementById("ask-" + sym).textContent = parseFloat(data.a).toFixed(2);
      document.getElementById("bid-" + sym).textContent = parseFloat(data.b).toFixed(2);
      const changeEl = document.getElementById("change-" + sym);
      changeEl.textContent = parseFloat(data.P).toFixed(2) + "%";
      changeEl.style.color = parseFloat(data.P) >= 0 ? "green" : "red";
    };
  });

  document.querySelectorAll("#price-table tbody tr").forEach(row => {
    row.addEventListener("click", () => {
      if (selectedRow) selectedRow.classList.remove("selected");
      row.classList.add("selected");
      selectedRow = row;
      const symbol = row.dataset.symbol;
      loadChart(symbol);
    });
  });
});
