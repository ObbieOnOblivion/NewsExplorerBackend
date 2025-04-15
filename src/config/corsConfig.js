// config/corsConfig.js
const developmentOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ];
  
  const productionOrigins = [
    'https://your-production-frontend.com'
  ];
  
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check against allowed origins
      const allowedOrigins = process.env.NODE_ENV === 'production'
        ? productionOrigins
        : developmentOrigins;
  
      // Normalize origin to handle both localhost and 127.0.0.1
      const normalizedOrigin = origin.replace('http://127.0.0.1:', 'http://localhost:');
  
      if (
        allowedOrigins.includes(normalizedOrigin) || 
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  module.exports = corsOptions;