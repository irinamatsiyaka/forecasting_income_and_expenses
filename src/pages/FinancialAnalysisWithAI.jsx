import React, { useState, useEffect } from "react";
import { cohereGenerateText } from "../ai/cohereApi";

const FinancialAnalysisWithAI = () => {
   const [aiResult, setAiResult] = useState("");
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState([]);

   useEffect(() => {
      fetch("https://api.jsonbin.io/v3/qs/67f6ee7b8a456b796685ffd5")
         .then((res) => res.json())
         .then((json) => setData(json.record));
   }, []);

   const prompt = `
Вот JSON-файл с доходами и расходами пользователя:

${JSON.stringify(data, null, 2)}

Пожалуйста, проанализируй эти финансовые данные и дай рекомендации:
1) Как можно сократить расходы?
2) Как увеличить доходы?
3) На что обратить внимание?

Дай детальный ответ.
`;

   async function handleAnalyze() {
      setLoading(true);
      setAiResult("");

      try {
         const response = await cohereGenerateText(prompt);
         if (response.generations && response.generations.length > 0) {
            setAiResult(response.generations[0].text);
         } else {
            setAiResult("No text generated.");
         }
      } catch (error) {
         console.error("Cohere error:", error);
         setAiResult("Ошибка: " + error.message);
      } finally {
         setLoading(false);
      }
   }

   return (
      <div style={{ padding: "1rem" }}>
         <h1>Финансовый анализ (пример) через Cohere</h1>

         <h2>Промпт, который мы отправим в ИИ:</h2>
         <pre style={{ background: "#f0f0f0", padding: "1rem" }}>{prompt}</pre>

         <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Анализирую..." : "Анализировать"}
         </button>

         {aiResult && (
            <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
               <h2>Результат от Cohere:</h2>
               <p>{aiResult}</p>
            </div>
         )}
      </div>
   );
};

export default FinancialAnalysisWithAI;
