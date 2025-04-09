// src/ai/recommendations.js

/**
 * На основе разницы доход/расход, выдаём простейшие рекомендации:
 * - если расходы сильно растут, советуем "сократить"
 * - если доходы растут, "можно накопить"
 */
export function generateAIRecommendations(
   realIncome,
   realExpense,
   forecastIncome,
   forecastExpense
) {
   const recs = [];
   // Смотрим текущее соотношение
   if (realExpense > realIncome) {
      recs.push(
         "Ваши расходы превышают доходы. Рекомендуется пересмотреть траты."
      );
   } else {
      recs.push("Отлично! Текущие доходы покрывают расходы.");
   }

   // По прогнозу
   if (forecastExpense > forecastIncome) {
      recs.push(
         "Прогноз показывает, что в будущем расходы будут превышать доходы. Попробуйте сократить необязательные покупки."
      );
   } else {
      recs.push(
         "Согласно прогнозу, у вас останутся свободные средства. Можно отложить больше в копилку!"
      );
   }

   return recs;
}
