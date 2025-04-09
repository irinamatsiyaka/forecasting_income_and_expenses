// src/pages/CohereDemoPage.jsx
import React, { useState } from "react";
import { cohereGenerateText } from "../ai/cohereApi";

const CohereDemoPage = () => {
   const [prompt, setPrompt] = useState("");
   const [result, setResult] = useState("");
   const [loading, setLoading] = useState(false);
   const [errorMsg, setErrorMsg] = useState("");

   async function handleGenerate() {
      setLoading(true);
      setResult("");
      setErrorMsg("");

      try {
         const response = await cohereGenerateText(prompt);
         // По документации Cohere, сгенерированный текст находится в response.generations[0].text
         if (response.generations && response.generations.length > 0) {
            setResult(response.generations[0].text);
         } else {
            setResult("No text generated.");
         }
      } catch (error) {
         setErrorMsg(error.message);
         console.error("Cohere error:", error);
      } finally {
         setLoading(false);
      }
   }

   return (
      <div style={{ padding: "1rem" }}>
         <h1>Демонстрация Cohere API</h1>
         <p>Введите запрос (prompt), нажмите «Сгенерировать».</p>

         <textarea
            rows={5}
            cols={60}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Введите свой промпт..."
         />
         <br />
         <button onClick={handleGenerate} disabled={loading || !prompt}>
            {loading ? "Генерация..." : "Сгенерировать"}
         </button>

         {errorMsg && <p style={{ color: "red" }}>Ошибка: {errorMsg}</p>}

         {result && (
            <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
               <h3>Результат:</h3>
               <p>{result}</p>
            </div>
         )}
      </div>
   );
};

export default CohereDemoPage;
