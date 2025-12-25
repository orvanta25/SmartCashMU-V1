import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();
    res.on('finish', () => {
      const duration = performance.now() - start;
      if (duration > 500) console.warn(`Slow request: ${req.url} - ${duration.toFixed(2)}ms`);
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    });
    next();
  }
}
