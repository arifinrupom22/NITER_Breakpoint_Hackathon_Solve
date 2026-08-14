// ============================================================================
// NITER Smart Transport Backend — Express REST API + Socket.IO realtime.
// Run:  npm install && npm start   (default http://localhost:3001)
// ============================================================================

import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { config } from './src/config.js';
import { ensureSeededPasswords } from './src/auth.js';
import { getDb } from './src/db.js';
import { initRealtime } from './src/realtime/hub.js';
import { startSimulator } from './src/realtime/simulator.js';

// Auth routes
import { router as authRouter } from './src/auth.js';
// Feature routes
import { router as transportRouter, publicRouter } from './src/routes/transport.js';
import { router as portalRouter, publicRouter as portalPublicRouter } from './src/routes/portal.js';
import { router as adminRouter } from './src/routes/admin.js';
import { router as aiRouter } from './src/routes/ai.js';

const db = getDb();
ensureSeededPasswords(db);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Simple request logger
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${req.path}`);
  next();
});

// Health + system info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NITER Smart Transport Backend',
    demoMode: config.demoMode,
    simTimeScale: config.simTimeScale,
    time: new Date().toISOString(),
  });
});

// REST routes
app.use('/api', publicRouter);       // /api/transport/public, /api/transport/schedule
app.use('/api', portalPublicRouter); // /api/portal/news, /events, /notices, /departments, /stats
app.use('/api/auth', authRouter);    // /api/auth/login, /verify, /driver-login
app.use('/api', transportRouter);    // /api/transport/*
app.use('/api', portalRouter);       // /api/portal/*
app.use('/api', adminRouter);        // /api/admin/*
app.use('/api', aiRouter);           // /api/ai/*

// 404 for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// Central error handler
app.use((err, _req, res, _next) => {
  console.error('[server]', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = http.createServer(app);
initRealtime(server);

server.listen(config.port, () => {
  console.log('==========================================================');
  console.log('  NITER Smart Transport Backend');
  console.log(`  REST + Socket.IO  ->  http://localhost:${config.port}`);
  console.log(`  Demo mode: ${config.demoMode}  |  Time scale: ${config.simTimeScale}x`);
  console.log('  Endpoints: /api/transport/* /api/portal/* /api/admin/* /api/ai/*');
  console.log('==========================================================');
  startSimulator({ intervalMs: 1000 });
});
