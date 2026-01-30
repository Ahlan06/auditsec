import OpenAI from 'openai';

export const getOpenAIClient = () => {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  return new OpenAI({ apiKey });
};

export const getOpenAIModel = () => {
  return (process.env.OPENAI_MODEL || '').trim() || 'gpt-4o-mini';
};
