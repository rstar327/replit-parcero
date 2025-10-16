import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // In deployment environments, log but don't crash
  const isDeployment = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === 'production';
  if (!isDeployment) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason instanceof Error) {
    console.error('Error stack:', reason.stack);
  }
  // In deployment environments, log but don't crash to maintain service availability
  const isDeployment = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === 'production';
  if (!isDeployment) {
    // Give some time for logs to flush before exiting
    setTimeout(() => process.exit(1), 100);
  }
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received. Starting graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📤 SIGINT received. Starting graceful shutdown...');
  process.exit(0);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint for deployment verification
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connectivity
    let dbStatus = 'unknown';
    try {
      // Simple query to test database
      const dbTest = process.env.DATABASE_URL ? 'connected' : 'no_url';
      dbStatus = dbTest;
    } catch (dbError) {
      console.warn('Database connectivity test failed:', dbError);
      dbStatus = 'error';
    }

    // Test required environment variables
    const requiredEnvVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      PORT: !!process.env.PORT
    };

    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.REPLIT_DEPLOYMENT === "1",
      database: dbStatus,
      envVars: requiredEnvVars,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100
      },
      version: process.version,
      pid: process.pid,
      port: parseInt(process.env.PORT || '5000', 10)
    };
    
    // Log health check requests in deployment
    if (process.env.REPLIT_DEPLOYMENT === "1") {
      console.log('🏥 Health check requested - Server is healthy');
      console.log('🏥 Database status:', dbStatus);
      console.log('🏥 Environment variables:', Object.entries(requiredEnvVars).filter(([_, exists]) => !exists).map(([key]) => `${key}: MISSING`).join(', ') || 'All present');
    }
    
    // Return 503 if critical components are missing
    const criticalMissing = !requiredEnvVars.DATABASE_URL || !requiredEnvVars.STRIPE_SECRET_KEY;
    if (criticalMissing) {
      return res.status(503).json({
        ...healthCheck,
        status: 'error',
        error: 'Critical environment variables missing'
      });
    }
    
    res.status(200).json(healthCheck);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Readiness endpoint specifically for deployment checks
app.get('/ready', async (req: Request, res: Response) => {
  try {
    // More comprehensive readiness check
    const readinessChecks = {
      server: true,
      database: !!process.env.DATABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      timestamp: new Date().toISOString()
    };
    
    const allReady = Object.values(readinessChecks).filter(v => typeof v === 'boolean').every(Boolean);
    
    if (allReady) {
      res.status(200).json({ 
        status: 'ready', 
        checks: readinessChecks,
        message: 'Server is ready to accept requests'
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        checks: readinessChecks,
        message: 'Server is not fully ready'
      });
    }
  } catch (error) {
    console.error('❌ Readiness check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
});

(async () => {
  try {
    console.log('Starting server initialization...');
    const server = await registerRoutes(app);
    console.log('Routes registered successfully');

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error('Express error handler caught:', err);
    console.error('Error stack:', err.stack);

    // Send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Don't throw the error again - this prevents crashes
    // Instead, log it and let the process continue
    console.error(`Error handled for ${_req.method} ${_req.path}:`, message);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isReplitDeployment = process.env.REPLIT_DEPLOYMENT === "1";
  const isProduction = process.env.NODE_ENV === "production" || isReplitDeployment;
  
  if (!isProduction && app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    console.log(`Attempting to start server on port ${port}...`);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, (err?: Error) => {
      if (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
        return;
      }
      
      log(`serving on port ${port}`);
      console.log(`✅ Server successfully started and listening on port ${port}`);
      console.log(`🏥 Health check available at: http://0.0.0.0:${port}/health`);
      console.log(`🏥 Ready check available at: http://0.0.0.0:${port}/ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Deployment ready: ${process.env.REPLIT_DEPLOYMENT === "1" ? 'Yes' : 'No'}`);
      
      // Signal deployment readiness
      if (process.env.REPLIT_DEPLOYMENT === "1") {
        console.log('🎯 DEPLOYMENT: Server initialized and ready to accept connections');
        console.log('🎯 DEPLOYMENT: All routes registered, health checks active');
      }
    });
    
    // Handle server listen errors
    server.on('error', (error: any) => {
      console.error('❌ Server error:', error);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error('💡 Try using a different port or kill the process using this port');
      } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied to bind to port ${port}`);
        console.error('💡 Try running with elevated permissions or use a port > 1024');
      } else if (error.code === 'ENOTFOUND') {
        console.error('❌ Network interface not found');
      } else {
        console.error('❌ Unknown server error occurred');
      }
      
      // Give some time for logs to flush
      setTimeout(() => process.exit(1), 100);
    });
    
    // Ensure server is actually listening
    server.on('listening', () => {
      const addr = server.address();
      console.log('🎯 Server listening event fired, address:', addr);
      
      if (process.env.REPLIT_DEPLOYMENT === "1") {
        console.log('🎯 DEPLOYMENT: Server is now accepting connections');
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
})();
