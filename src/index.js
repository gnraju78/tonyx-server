import config from '../config/index.js';
import app from './app.js';
import { connectDB } from './utils/database.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║     TonyX Backend Server Running       ║
╠════════════════════════════════════════╣
║ Environment: ${config.env.padEnd(30)} ║
║ Port: ${config.port.toString().padEnd(36)} ║
║ URL: ${config.baseUrl.padEnd(36)} ║
╚════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
