import { Order, Department, DashboardStats } from '../types';

const DB_NAME = 'RingOfficeDB';
const DB_VERSION = 1;

interface DBSchema {
  orders: Order[];
  departments: Department[];
  stats: DashboardStats;
  activityLog: {
    id: number;
    timestamp: string;
    action: string;
    details: any;
  }[];
}

class DatabaseService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('departments')) {
          db.createObjectStore('departments', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('activityLog')) {
          db.createObjectStore('activityLog', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private getStore(storeName: keyof DBSchema, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async logActivity(action: string, details: any): Promise<void> {
    const store = this.getStore('activityLog', 'readwrite');
    const activity = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    await this.promisifyRequest(store.add(activity));
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllOrders(): Promise<Order[]> {
    const store = this.getStore('orders');
    return this.promisifyRequest(store.getAll());
  }

  async saveOrder(order: Order): Promise<void> {
    const store = this.getStore('orders', 'readwrite');
    await this.promisifyRequest(store.put(order));
    await this.logActivity('saveOrder', { orderId: order.id });
  }

  async updateOrder(order: Order): Promise<void> {
    const store = this.getStore('orders', 'readwrite');
    await this.promisifyRequest(store.put(order));
    await this.logActivity('updateOrder', { orderId: order.id });
  }

  async getAllDepartments(): Promise<Department[]> {
    const store = this.getStore('departments');
    return this.promisifyRequest(store.getAll());
  }

  async saveDepartments(departments: Department[]): Promise<void> {
    const store = this.getStore('departments', 'readwrite');
    await Promise.all(departments.map(dept => this.promisifyRequest(store.put(dept))));
    await this.logActivity('saveDepartments', { count: departments.length });
  }

  async saveStats(stats: DashboardStats): Promise<void> {
    const store = this.getStore('stats', 'readwrite');
    await this.promisifyRequest(store.put({ ...stats, id: 'current' }));
    await this.logActivity('saveStats', stats);
  }

  async getStats(): Promise<DashboardStats | null> {
    const store = this.getStore('stats');
    const stats = await this.promisifyRequest(store.get('current'));
    return stats || null;
  }

  async getActivityLog(): Promise<DBSchema['activityLog']> {
    const store = this.getStore('activityLog');
    return this.promisifyRequest(store.getAll());
  }
}

export const db = new DatabaseService();