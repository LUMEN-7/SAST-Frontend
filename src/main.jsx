import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import "./redesign.css";
import "./tool-shell.css";
import "./ares-theme.css";
import "./ares-compact.css";
import "./ares-palette.css";
import "./finish.css";
import "./responsive.css";
try { document.documentElement.dataset.aresTheme = localStorage.getItem("ares-theme") || "dark"; } catch { document.documentElement.dataset.aresTheme = "dark"; }
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
