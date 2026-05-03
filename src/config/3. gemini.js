import { GoogleGenerativeAI } from "@google/generative-ai";
import Logger from "../utils/logger.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    Logger.warn("GEMINI_API_KEY is not set. AI explanation features will be disabled.");
}
[genAI] = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : [null];
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
;
