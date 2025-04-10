import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
   return (
      <nav className="navbar">
         <ul>
            <li>
               <Link to="/">Dashboard</Link>
            </li>
            <li>
               <Link to="/transactions">Transactions</Link>
            </li>
            <li>
               <Link to="/analytics">Analytics</Link>
            </li>
            <li>
               <Link to="/advanced-forecast">Advanced Forecast</Link>
            </li>

            <li>
               <Link to="/fin-analysis">AI</Link>
            </li>
            <li>
               <Link to="/settings">Settings</Link>
            </li>
         </ul>
      </nav>
   );
};

export default NavBar;
