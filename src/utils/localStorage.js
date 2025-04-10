const STORAGE_KEY = "transactions";

export const loadTransactions = () => {
   try {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      console.log("Loaded from localStorage:", serializedData);
      if (!serializedData) return undefined;
      return JSON.parse(serializedData);
   } catch (err) {
      console.error("Error loading transactions from localStorage", err);
      return undefined;
   }
};

export const saveTransactions = (transactions) => {
   try {
      const serializedData = JSON.stringify(transactions);
      localStorage.setItem(STORAGE_KEY, serializedData);
   } catch (err) {
      console.error("Error saving transactions to localStorage", err);
   }
};
