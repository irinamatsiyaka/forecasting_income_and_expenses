import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/common/NavBar";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";
import AdvancedForecastPage from "./pages/AdvancedForecastPage";
import FinancialAnalysisWithAI from "./pages/FinancialAnalysisWithAI";

function App() {
   return (
      <div className="App">
         <NavBar />
         <div className="container">
            <Routes>
               <Route path="/" element={<DashboardPage />} />
               <Route path="/transactions" element={<TransactionsPage />} />
               <Route path="/analytics" element={<AnalyticsPage />} />
               <Route path="/settings" element={<SettingsPage />} />

               <Route
                  path="/advanced-forecast"
                  element={<AdvancedForecastPage />}
               />
               <Route
                  path="/fin-analysis"
                  element={<FinancialAnalysisWithAI />}
               />
            </Routes>
         </div>
      </div>
   );
}

export default App;
