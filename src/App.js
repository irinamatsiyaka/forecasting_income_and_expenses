import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/common/NavBar";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ForecastPage from "./pages/ForecastPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";
import AdvancedForecastPage from "./pages/AdvancedForecastPage"; // Новый маршрут
// import CohereDemoPage from "./pages/CohereDemoPage";
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
               <Route path="/forecast" element={<ForecastPage />} />
               <Route path="/settings" element={<SettingsPage />} />

               <Route
                  path="/advanced-forecast"
                  element={<AdvancedForecastPage />}
               />
               {/* <Route path="/cohere-demo" element={<CohereDemoPage />} /> */}
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
