// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./users/context/SocketContext.jsx";
import { ToastProvider } from "./users/components/Toast.jsx";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <SocketProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </SocketProvider>
  // </StrictMode>,
);
