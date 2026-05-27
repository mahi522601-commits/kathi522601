import { getChatbotResponse } from '../services/chatbot.js';

export async function chat(req, res, next) {
  try {
    const { message, history = [], context = {} } = req.body;
    const response = await getChatbotResponse(message, history, context);
    res.json({ success: true, ...response });
  } catch (error) {
    next(error);
  }
}
