import { useSelector, useDispatch } from "react-redux";
import {
   addTransaction,
   updateTransaction,
   removeTransaction,
} from "../store/slices/transactionsSlice";

const useTransactions = () => {
   const transactions = useSelector((state) => state.transactions.transactions);
   const dispatch = useDispatch();

   const add = (transaction) => dispatch(addTransaction(transaction));
   const update = (transaction) => dispatch(updateTransaction(transaction));
   const remove = (id) => dispatch(removeTransaction(id));

   return { transactions, add, update, remove };
};

export default useTransactions;
