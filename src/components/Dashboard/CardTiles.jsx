// src/components/Dashboard/CardTiles.jsx
import React from "react";
import "./CardTiles.css"; // стили карточек

const CardTiles = ({ tilesData }) => {
   return (
      <div className="tiles-container">
         {tilesData.map((tile, index) => (
            <div
               className="tile"
               key={index}
               style={{
                  background: tile.gradient || "#0f0f0f", // фон по умолчанию, если нет tile.gradient
               }}
            >
               <div className="tile-icon">
                  <i className={tile.iconClass}></i>
               </div>
               <div className="tile-info">
                  <h3>{tile.title}</h3>
                  <p className="tile-main-value">{tile.value}</p>
                  {tile.subValue && (
                     <p className="tile-sub-value">{tile.subValue}</p>
                  )}
               </div>
            </div>
         ))}
      </div>
   );
};

export default CardTiles;
