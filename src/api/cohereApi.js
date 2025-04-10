// src/api/cohereApi.js

export async function cohereGenerateText(prompt) {
   // Получаем ключ из переменных окружения
   const apiKey = "ymwZR95ku6YBtNrrXLsPJz3UfQ15tjF7AdAH1tIO";
   if (!apiKey) {
      throw new Error(
         "Cohere API key not found. Add REACT_APP_COHERE_API_KEY to .env"
      );
   }

   // Эндпоинт Cohere для генерации
   const endpoint = "https://api.cohere.ai/v1/generate";

   // Тело запроса (можно варьировать)
   const body = {
      model: "command-xlarge",
      prompt: prompt,
      max_tokens: 5000, // Можно увеличить, если нужен большой ответ
      temperature: 0.7, // Креативность
      // Другие параметры: top_k, top_p, stop_sequences, и т.д. по документации
   };

   const response = await fetch(endpoint, {
      method: "POST",
      headers: {
         Authorization: `BEARER ${apiKey}`,
         "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
   });

   if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Cohere API Error: " + errorText);
   }

   const result = await response.json();
   return result;
}
