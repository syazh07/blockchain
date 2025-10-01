import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage.jsx"; // Single login page
import App from "./App.jsx"; // Tourist Registration
import PoliceDashboard from "./PoliceDashboard.jsx"; // Police Dashboard

function RouterComponent() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/tourist" element={<App />} />
      <Route path="/police" element={<PoliceDashboard />} />
    </Routes>
  );
}

export default RouterComponent;
