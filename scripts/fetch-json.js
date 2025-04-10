// scripts/fetch-json.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const JSONBIN_URL = "https://api.jsonbin.io/v3/qs/67f6ee7b8a456b796685ffd5";
const localFilePath = path.join(
   __dirname,
   "..",
   "src",
   "data",
   "defaultTransactions.json"
);

async function updateLocalJSON() {
   try {
      console.log("Fetching data from JSONBin...");

      //  Получаем данные через axios
      const response = await axios.get(JSONBIN_URL);
      const json = response.data;

      // Извлекаем массив транзакций
      const data = Array.isArray(json.record)
         ? json.record
         : json.record?.record || [];

      console.log("Fetched transactions:", data.length, "items");

      fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2));
      console.log("defaultTransactions.json успешно обновлен!");
   } catch (error) {
      console.error("Ошибка при загрузке JSON:", error);
      process.exit(1);
   }
}

updateLocalJSON();
