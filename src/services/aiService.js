import axios from "axios";
import { AI_API_URL, AI_API_KEY } from "../config/config";

export const analyzeData = (data) => {
   // Логика интеграции с внешним AI-сервисом
   return axios.post(`${AI_API_URL}/analyze`, data, {
      headers: { Authorization: `Bearer ${AI_API_KEY}` },
   });
};

export default { analyzeData };
