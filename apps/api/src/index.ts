import app from './app';
import { config } from './config';
import { redis } from './config/redis';
import { prisma } from '@learnhub/database';

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');

    // Test Redis connection
    await redis.ping();
    console.log('✅ Redis connected');

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`
🚀 LearnHub API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL:         http://localhost:${config.port}
📍 Environment: ${config.nodeEnv}
📍 API:         http://localhost:${config.port}/api/v1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        await prisma.$disconnect();
        console.log('✅ Database disconnected');
        
        redis.disconnect();
        console.log('✅ Redis disconnected');
        
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();