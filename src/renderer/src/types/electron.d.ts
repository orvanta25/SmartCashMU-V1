declare global {
  interface Window {
    electron: {
      caisse: {
        getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
        getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        create: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
        update: (params: { id: string; data: any }) => Promise<{ success: boolean; data?: any; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
        test: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        setCentral: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        removeCentral: () => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}

export {};