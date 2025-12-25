// src/utils/requestGuard.ts
class RequestGuard {
  private static instance: RequestGuard;
  private pendingRequests = new Map<string, Promise<any>>();
  private requestTimestamps = new Map<string, number>();
  private readonly REQUEST_TIMEOUT = 30000; // 30 secondes

  private constructor() {}

  static getInstance(): RequestGuard {
    if (!RequestGuard.instance) {
      RequestGuard.instance = new RequestGuard();
    }
    return RequestGuard.instance;
  }

  execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: { timeout?: number; retry?: boolean } = {}
  ): Promise<T> {
    const now = Date.now();
    const lastRequestTime = this.requestTimestamps.get(key) || 0;
    
    // Protection 1 : Délai minimum entre 2 requêtes identiques
    if (now - lastRequestTime < 1000) { // 1 seconde
      console.warn(`⚠️ Requête ${key} ignorée (trop rapide)`);
      return Promise.reject(new Error('Requête trop rapide, veuillez patienter'));
    }

    // Protection 2 : Vérifier si la même requête est déjà en cours
    if (this.pendingRequests.has(key)) {
      console.warn(`⚠️ Requête ${key} déjà en cours`);
      return this.pendingRequests.get(key)!;
    }

    // Protection 3 : Marquer le timestamp
    this.requestTimestamps.set(key, now);

    // Créer la promesse avec timeout
    const timeout = options.timeout || this.REQUEST_TIMEOUT;
    const requestPromise = new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(key);
        reject(new Error(`Timeout après ${timeout}ms`));
      }, timeout);

      requestFn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        })
        .finally(() => {
          // Nettoyer après un délai minimum
          setTimeout(() => {
            this.pendingRequests.delete(key);
          }, 1000);
        });
    });

    // Stocker la promesse
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  clear() {
    this.pendingRequests.clear();
    this.requestTimestamps.clear();
  }
}

export const requestGuard = RequestGuard.getInstance();