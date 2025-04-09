import React from "react";

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
   return (
      <div className="transaction-item">
         <div>
            <strong>{transaction.description}</strong>
            <p>{transaction.date}</p>
         </div>
         <div>
            <span>{transaction.amount}</span>
            <button onClick={() => onEdit(transaction)}>Edit</button>
            <button onClick={() => onDelete(transaction.id)}>Delete</button>
         </div>
      </div>
   );
};

export default TransactionItem;
