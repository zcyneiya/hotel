import axios from 'axios';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export const aiService = {
  chat: async (hotelId: string, messages: ChatMessage[]): Promise<string> => {
    const response = await apiClient.post('/ai/chat', { hotelId, messages });
    return response.data.reply;
  },
};
