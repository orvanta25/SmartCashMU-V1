import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as path from 'path';

@Injectable()
export class SmartOptimizationService implements OnApplicationBootstrap {
  private readonly logger = new Logger('SmartOptimization');
  private archiveDbPath = path.join(process.cwd(), 'data', 'archive.db');
  private isOptimizing = false;
  private readonly MEMORY_THRESHOLD = 80;

  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    await this.configureSqliteForPerformance();
    this.startMemoryMonitoring();

    // Vérifie si une optimisation a été manquée (ex: caisse fermée hier)
    const lastOptimization = await this.getLastOptimizationDate();
    const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    if (!lastOptimization || lastOptimization < today) {
      this.logger.log('Dernière optimisation manquée, lancement immédiat');
      await this.performIntelligentOptimization();
    }
  }

  private async configureSqliteForPerformance() {
    await this.prisma.$executeRaw`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA temp_store = MEMORY;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
      PRAGMA optimize;
    `;
    this.logger.log('SQLite optimisé avec WAL et PRAGMAs');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async performIntelligentOptimization() {
    if (this.isOptimizing) return;
    this.isOptimizing = true;

    try {
      const alreadyRun = await this.hasAlreadyRunToday();
      if (alreadyRun) {
        this.logger.log('Optimisation déjà effectuée aujourd’hui, on saute.');
        return;
      }

      await this.intelligentArchive();
      await this.conditionalVacuum();
      await this.updateLastOptimizationDate();
      this.logger.log('Optimisation complète et enregistrée.');
    } finally {
      this.isOptimizing = false;
    }
  }

private async intelligentArchive() {
  // Attacher archive.db et créer la table si elle n'existe pas
  await this.prisma.$executeRaw`
    ATTACH DATABASE '${this.archiveDbPath}' AS archive;
    CREATE TABLE IF NOT EXISTS archive.Commande AS SELECT * FROM main.Commande WHERE 0;
  `;

  // Insérer au maximum 10 commandes anciennes dans archive.db et les supprimer dans main
  await this.prisma.$executeRawUnsafe(`
    INSERT INTO archive.Commande
    SELECT * FROM main.Commande 
    WHERE date < date('now','-90 days') 
    LIMIT 10;
    
    DELETE FROM main.Commande 
    WHERE id IN (
      SELECT id FROM main.Commande 
      WHERE date < date('now','-90 days') 
      LIMIT 10
    );
  `);

  // Détacher la base archive.db
  await this.prisma.$executeRaw`DETACH DATABASE archive`;

  this.logger.log('Archivage “safe” terminé (10 lignes maximum)');
}


  private async conditionalVacuum() {
    await this.prisma.$executeRaw`VACUUM;`;
    this.logger.log('VACUUM exécuté');
  }

  private startMemoryMonitoring() {
    setInterval(() => {
      const usage = process.memoryUsage();
      const percent = (usage.heapUsed / usage.heapTotal) * 100;
      if (percent > this.MEMORY_THRESHOLD) {
        console.warn(`Memory usage high: ${percent.toFixed(1)}%`);
      }
    }, 60000);
  }

  // --- Gestion du log d'optimisation ---
  private async getLastOptimizationDate(): Promise<string | null> {
    const result = await this.prisma.$queryRaw<{ lastRun: string }[]>`
      SELECT lastRun FROM OptimizationLog ORDER BY id DESC LIMIT 1;
    `;
    return result[0]?.lastRun || null;
  }

  private async updateLastOptimizationDate() {
    const now = new Date().toISOString();
    await this.prisma.$executeRaw`
      INSERT INTO OptimizationLog (lastRun) VALUES (${now});
    `;
  }

  private async hasAlreadyRunToday(): Promise<boolean> {
    const lastRun = await this.getLastOptimizationDate();
    if (!lastRun) return false;
    const today = new Date().toDateString();
    return new Date(lastRun).toDateString() === today;
  }
}
