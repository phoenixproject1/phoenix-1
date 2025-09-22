// balance.js
export let balance = 10000;
export let trades = [];

export function updateBalanceUI(unrealized) {
  document.getElementById("balance").textContent = balance.toFixed(2);
  document.getElementById("equity").textContent = (balance + unrealized).toFixed(2);
}
