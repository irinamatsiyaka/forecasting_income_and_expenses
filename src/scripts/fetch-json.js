// scripts/fetch-json.js
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // Если у тебя Node 18+, fetch встроен

// Ссылка на бин JSONBin
const JSONBIN_URL = "https://api.jsonbin.io/v3/qs/67f6ee7b8a456b796685ffd5";

// Путь к локальному файлу
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
      const res = await fetch(JSONBIN_URL);
      const json = await res.json();

      // JSONBin отдает: { id: "...", record: [ ... ] }
      // Нам нужен массив в "record"
      const data = Array.isArray(json.record)
         ? json.record
         : json.record?.record || [];

      console.log("Fetched transactions:", data.length, "items");

      // Записываем в defaultTransactions.json (который твой код импортит)
      fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2));

      console.log("✅ defaultTransactions.json успешно обновлен!");
   } catch (error) {
      console.error("Ошибка при загрузке JSON:", error);
      process.exit(1);
   }
}

updateLocalJSON();
