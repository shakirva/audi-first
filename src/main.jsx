import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { DemoProvider } from "./context/DemoContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
