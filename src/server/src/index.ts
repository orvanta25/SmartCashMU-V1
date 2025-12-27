// server/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import syncRouter from './api/sync';
import { createLogger } from './service/logger.service';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const logger = createLogger();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use('/api/sync', syncRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  logger.info(`🚀 Serveur de synchronisation démarré sur le port ${PORT}`);
  logger.info(`📡 Endpoint sync: http://localhost:${PORT}/api/sync`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  logger.info('Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Arrêt du serveur (Ctrl+C)...');
  process.exit(0);
});

export default app;