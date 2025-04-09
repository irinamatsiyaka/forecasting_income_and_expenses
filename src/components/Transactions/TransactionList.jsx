import React from "react";

const TransactionList = ({ transactions, onDelete }) => {
   return (
      <div className="transaction-list">
         <h2>All Transactions</h2>
         {transactions.length === 0 ? (
            <p>No transactions yet.</p>
         ) : (
            transactions.map((t) => (
               <div
                  key={t.id}
                  style={{ borderBottom: "1px solid #ddd", margin: "0.5rem 0" }}
               >
                  <p>
                     <strong>{t.description}</strong> | {t.date} |
                     <span
                        style={{ color: t.type === "income" ? "green" : "red" }}
                     >
                        {t.type === "income" ? "+" : "-"}
                        {Math.abs(t.amount)}
                     </span>
                     {t.isPlanned && <em> (Planned)</em>} | Category:{" "}
                     {t.category || "Other"}
                  </p>
                  <button onClick={() => onDelete(t.id)}>Delete</button>
               </div>
            ))
         )}
      </div>
   );
};

export default TransactionList;
