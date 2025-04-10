import React, { useState } from "react";
import defaultTransactions from "../data/defaultTransactions.json";
import { cohereGenerateText } from "../api/cohereApi";


const FinancialAnalysisWithAI = () => {
   const [aiResult, setAiResult] = useState("");
   const [loading, setLoading] = useState(false);

   const prompt = `
Вот JSON-файл с доходами и расходами пользователя:

${JSON.stringify(defaultTransactions, null, 2)}

Пожалуйста, проанализируй эти финансовые данные и дай рекомендации:
1) Как можно сократить расходы?
2) Как увеличить доходы?
3) На что обратить внимание?

Дай детальный ответ.
`;

   // Функция вызова Cohere
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
         <h1>Финансовый анализ через Cohere</h1>

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
