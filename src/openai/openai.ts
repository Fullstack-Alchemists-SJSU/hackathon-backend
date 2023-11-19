import { OpenAI } from 'openai';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions.mjs';
require('dotenv').config();

export const GPT_MODEL: ChatCompletionCreateParamsBase['model'] = 'gpt-3.5-turbo-16k-0613';
const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export default openAi;
