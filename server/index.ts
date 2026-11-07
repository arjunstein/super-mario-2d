import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db.js';
import { apiRouter } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & tables
initDatabase();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// API endpoints
app.use('/api', apiRouter);

// Serve static build from dist directory
const distDir = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  // Helpful fallback in development if dist is not built yet
  app.get('/', (_req, res) => {
    res.send('Super Mario 2D API Server is running. In dev mode, open Vite client (default: http://localhost:5173) or run `npm run build` first.');
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`[Super Mario 2D] Server listening on http://0.0.0.0:${port}`);
  console.log(`[Super Mario 2D] Environment: ${process.env.NODE_ENV || 'development'}`);
});

