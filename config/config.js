export const config = {
  language: {
    code: 'mr-IN', // Marathi - India
    name: 'Marathi',
    locale: 'mr_IN'
  },
  voice: {
    input: {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      encoding: 'LINEAR16'
    },
    output: {
      rate: 16000,
      channels: 1,
      bitDepth: 16
    }
  },
  agent: {
    maxTurns: 20,
    conversationTimeout: 30 * 60 * 1000, // 30 minutes
    maxRetries: 3,
    retryDelay: 1000
  },
  llm: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1000,
    timeout: 30000
  },
  memory: {
    maxContextLength: 10,
    persistance: true,
    storageFile: './data/conversation_history.json'
  },
  api: {
    schemeCheckEndpoint: 'http://localhost:3001/api/schemes/check-eligibility',
    applySchemeEndpoint: 'http://localhost:3001/api/schemes/apply',
    statusCheckEndpoint: 'http://localhost:3001/api/schemes/status'
  },
  logging: {
    level: 'info',
    enableFileLogging: true,
    logFile: './logs/agent.log'
  }
};

export default config;
