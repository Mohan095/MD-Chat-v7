// Set your Render backend URL here after deploying backend/ on Render:
// Example: "https://md-chat-backend.onrender.com"
window.MD_CHAT_API_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost" || location.hostname.startsWith("192.168."))
    ? ""
    : "https://YOUR-RENDER-BACKEND.onrender.com";
