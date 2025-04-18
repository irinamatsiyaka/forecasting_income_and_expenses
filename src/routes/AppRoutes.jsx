import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ForecastPage from "../pages/ForecastPage";
import SettingsPage from "../pages/SettingsPage";
import AdvancedForecastPage from "../pages/AdvancedForecastPage";

const NotFoundPage = () => (
   <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Страница не найдена</h1>
      <p>Извините, запрошенная страница не существует.</p>
   </div>
);

const AppRoutes = () => {
   return (
      <Routes>
         <Route path="/" element={<DashboardPage />} />
         <Route path="/transactions" element={<TransactionsPage />} />
         <Route path="/analytics" element={<AnalyticsPage />} />
         <Route path="/settings" element={<SettingsPage />} />

         <Route path="/advanced-forecast" element={<AdvancedForecastPage />} />
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
   );
};

export default AppRoutes;
