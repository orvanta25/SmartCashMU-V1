import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MemoryGuard {
 private readonly logger = new Logger('MemoryGuard');
 private readonly memoryThreshold = 0.85; // 85%

 checkMemoryUsage() {
   const used = process.memoryUsage();
   const total = used.heapTotal;
   const usedPercent = used.heapUsed / total;

   if (usedPercent > this.memoryThreshold) {
     this.logger.warn(`Memory usage is high: ${(usedPercent * 100).toFixed(2)}%`);
     // Ici, vous pouvez prendre des mesures comme nettoyer un cache ou forcer un garbage collection
     if (global.gc) {
       global.gc();
       this.logger.log('Garbage collection forced');
     } else {
       this.logger.warn('Garbage collection is not exposed. Run node with --expose-gc');
     }
   }
 }
}