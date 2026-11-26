// Set your Render backend URL here after deploying backend/ to Render:
window.API_BASE = (
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
)
  ? "http://127.0.0.1:5000"
  : "https://YOUR-RENDER-BACKEND.onrender.com";
