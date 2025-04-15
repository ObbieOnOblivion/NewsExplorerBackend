const app = require('./app');
const { port } = require('./config');
const { connectDB } = require('./config/db');

async function startServer() {
  try {
    await connectDB();
    
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Only start server if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = startServer;