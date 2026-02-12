
import { SaleRecord, ReportMetadata, DashboardStats } from '../types';

/**
 * NeuralDatabase: A high-performance IndexedDB wrapper
 * Simulates a PostgreSQL backend for persistence.
 */
export class NeuralDatabase {
  private dbName = 'NeuralInflowDB';
  private version = 1;

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveReport(stats: DashboardStats, filename: string): Promise<string> {
    const db = await this.init();
    const id = crypto.randomUUID();
    const metadata: ReportMetadata = {
      id,
      filename,
      timestamp: Date.now(),
      totalSales: stats.totalSales,
      topDealer: stats.topDealer,
      healthScore: stats.healthScore || 100
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['reports', 'stats'], 'readwrite');
      tx.objectStore('reports').add(metadata);
      tx.objectStore('stats').add({ ...stats, id });
      tx.oncomplete = () => resolve(id);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getReports(): Promise<ReportMetadata[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('reports', 'readonly');
      const request = tx.objectStore('reports').getAll();
      request.onsuccess = () => resolve(request.result.sort((a, b) => b.timestamp - a.timestamp));
      request.onerror = () => reject(request.error);
    });
  }

  async getReportStats(id: string): Promise<DashboardStats | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('stats', 'readonly');
      const request = tx.objectStore('stats').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReport(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['reports', 'stats'], 'readwrite');
      tx.objectStore('reports').delete(id);
      tx.objectStore('stats').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new NeuralDatabase();
