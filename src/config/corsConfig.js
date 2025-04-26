const developmentOrigins = ['http://localhost:3001', 'http://127.0.0.1:3001'];

const productionOrigins = ['https://your-production-frontend.com'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins =
      process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins;

    const normalizedOrigin = origin.replace('http://127.0.0.1:', 'http://localhost:');

    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
