import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

const projectBase = "/DarksideRF.com";
const basename =
  window.location.pathname === projectBase || window.location.pathname.startsWith(`${projectBase}/`)
    ? projectBase
    : "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
