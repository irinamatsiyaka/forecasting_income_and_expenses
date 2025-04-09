import axios from "axios";
import { API_BASE_URL } from "../config/config";

const apiService = axios.create({
   baseURL: API_BASE_URL,
});

export const getTransactions = () => apiService.get("/transactions");

export const addTransaction = (transaction) =>
   apiService.post("/transactions", transaction);

export const updateTransaction = (id, transaction) =>
   apiService.put(`/transactions/${id}`, transaction);

export const deleteTransaction = (id) =>
   apiService.delete(`/transactions/${id}`);

export default apiService;
