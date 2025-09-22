// ui.js
export function showNotification(message, type = "info") {
  const div = document.createElement("div");
  div.className = `notification ${type}`;
  div.textContent = message;
  Object.assign(div.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: type === "error" ? "#f44336" : "#4caf50",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "5px",
    zIndex: 1000
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
