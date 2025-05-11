// Define allowed CORS origins for development
const developmentOrigins = ['http://localhost:3001', 'http://127.0.0.1:3001'];

// Define allowed CORS origins for production
const productionOrigins = ['https://your-production-frontend.com'];

// CORS middleware configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests or tools like Postman (no Origin header)
    if (!origin) return callback(null, true);

    // Select origins based on environment
    const allowedOrigins =
      process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins;

    // Normalize localhost variants
    const normalizedOrigin = origin.replace('http://127.0.0.1:', 'http://localhost:');

    // Allow origin if it's in the allowed list
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject disallowed origins
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
