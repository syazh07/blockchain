import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouterComponent from "./Routes.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Wrap everything with ThirdwebProvider */}
      <BrowserRouter>
        <RouterComponent />
      </BrowserRouter>
  </React.StrictMode>
);
