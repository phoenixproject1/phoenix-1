let selectedSymbol = "BTCUSDT";
let chart;
let chartData = [];

// لیست نمادهای برتر
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "SOLUSDT"];

// ایجاد جدول نمادها
const tableBody = document.querySelector("#symbolsTable tbody");
symbols.forEach(symbol => {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${symbol}</td><td id="${symbol}">---</td>`;
  row.addEventListener("click", () => selectSymbol(symbol, row));
  tableBody.appendChild(row);
});

// انتخاب نماد
function selectSymbol(symbol, row) {
  selectedSymbol = symbol;

  document.querySelectorAll("#symbolsTable tr").forEach(r => r.style.background = "");
  row.style.background = "#ddd";

  startSocket(symbol);
}

// ایجاد چارت
const ctx = document.getElementById("priceChart").getContext("2d");
chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "قیمت",
      data: [],
      borderColor: "blue"
    }]
  }
});

// اتصال WebSocket
let ws;
function startSocket(symbol) {
  if (ws) ws.close();

  ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const price = parseFloat(data.p);

    document.getElementById(symbol).textContent = price.toFixed(2);

    chart.data.labels.push("");
    chart.data.datasets[0].data.push(price);
    if (chart.data.labels.length > 50) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();

    updateTrades(price); // برای ترید
  };
}

// شروع اولیه
startSocket(selectedSymbol);
