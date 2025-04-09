import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TransactionForm from "../components/Transactions/TransactionForm";
import TransactionList from "../components/Transactions/TransactionList";
import {
   addTransaction,
   removeTransaction,
} from "../store/slices/transactionsSlice";
import { saveTransactions } from "../utils/localStorage";

const TransactionsPage = () => {
   const dispatch = useDispatch();
   const transactions = useSelector((state) => state.transactions.all);

   useEffect(() => {
      saveTransactions(transactions);
   }, [transactions]);

   const handleAddTransaction = (newTx) => {
      dispatch(addTransaction(newTx));
   };

   const handleDeleteTransaction = (id) => {
      dispatch(removeTransaction(id));
   };

   return (
      <div>
         <h1>Transactions</h1>
         <TransactionForm onSubmit={handleAddTransaction} />
         <TransactionList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
         />
      </div>
   );
};

export default TransactionsPage;
