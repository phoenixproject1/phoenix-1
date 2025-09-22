// app.js
const tableBody = document.querySelector("#symbolsTable tbody");
const ctx = document.getElementById("chartCanvas").getContext("2d");

let chart;
let selectedRow = null;

// اتصال به Binance WebSocket
const socket = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    tableBody.innerHTML = "";

    data.slice(0, 20).forEach((ticker) => {
        const row = document.createElement("tr");

        // symbol
        const symbolCell = document.createElement("td");
        symbolCell.textContent = ticker.s;

        // bid (قرمز)
        const bidCell = document.createElement("td");
        bidCell.textContent = parseFloat(ticker.b).toFixed(4);
        bidCell.style.color = "red";

        // ask (آبی)
        const askCell = document.createElement("td");
        askCell.textContent = parseFloat(ticker.a).toFixed(4);
        askCell.style.color = "blue";

        row.appendChild(symbolCell);
        row.appendChild(bidCell);
        row.appendChild(askCell);

        // انتخاب سطر
        row.addEventListener("click", () => {
            if (selectedRow) {
                selectedRow.classList.remove("selected");
            }
            row.classList.add("selected");
            selectedRow = row;

            updateChart(ticker.s);
        });

        tableBody.appendChild(row);
    });
};

// تابع آپدیت چارت
function updateChart(symbol) {
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: Array.from({ length: 20 }, (_, i) => i + 1),
            datasets: [{
                label: symbol,
                data: Array.from({ length: 20 }, () => Math.random() * 100),
                borderColor: "black",
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
