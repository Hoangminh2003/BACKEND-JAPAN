import { GoogleGenerativeAI } from "@google/generative-ai";
import Logger from "../utils/logger.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    Logger.warn("GEMINI_API_KEY is not set. AI explanation features will be disabled.");
}
