import React, { useState } from "react";

const TransactionForm = ({ onSubmit }) => {
   const [formData, setFormData] = useState({
      description: "",
      date: "",
      amount: 0,
      type: "income",
      isPlanned: false,
      periodicity: "none",
      category: "",
   });

   const handleChange = (e) => {
      const { name, value, type: inputType, checked } = e.target;
      if (inputType === "checkbox") {
         setFormData({ ...formData, [name]: checked });
      } else {
         setFormData({ ...formData, [name]: value });
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.description || !formData.date || !formData.amount) {
         alert("Please fill all fields");
         return;
      }
      onSubmit({
         ...formData,
         amount: parseFloat(formData.amount),
         id: Date.now(),
      });
      setFormData({
         description: "",
         date: "",
         amount: 0,
         type: "income",
         isPlanned: false,
         periodicity: "none",
         category: "",
      });
   };

   return (
      <div className="transaction-form">
         <h2>Add Transaction</h2>
         <form onSubmit={handleSubmit}>
            <div>
               <label>Description:</label>
               <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
               />
            </div>
            <div>
               <label>Date:</label>
               <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
               />
            </div>
            <div>
               <label>Amount:</label>
               <input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
               />
            </div>
            <div>
               <label>Type:</label>
               <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
               >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
               </select>
            </div>
            <div>
               <label>Category:</label>
               <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Food, Housing"
               />
            </div>
            <div>
               <label>Is Planned?:</label>
               <input
                  name="isPlanned"
                  type="checkbox"
                  checked={formData.isPlanned}
                  onChange={handleChange}
               />
            </div>
            <div>
               <label>Periodicity:</label>
               <select
                  name="periodicity"
                  value={formData.periodicity}
                  onChange={handleChange}
               >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="once">One-time planned</option>
               </select>
            </div>
            <button type="submit">Add</button>
         </form>
      </div>
   );
};

export default TransactionForm;
