

interface CreateMagasinDto {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  denomination: string;
  secteurActivite: string;
  region: string;
  ville: string;
  pays: string;
  password: string;
  confirmPassword: string;
}

interface UpdateMagasinDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  denomination?: string;
  secteurActivite?: string;
  region?: string;
  ville?: string;
  pays?: string;
  password?: string;
  confirmPassword?: string;
}

interface Magasin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  denomination: string;
  secteurActivite: string;
  region: string;
  ville: string;
  pays: string;
  type: string;
  parentEntrepriseId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateMagasinResponse {
  magasin: Magasin;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Create a new magasin
export function createMagasin(dto: CreateMagasinDto): Promise<CreateMagasinResponse> {
  return new Promise((resolve, reject) => {
    console.log("IPC: createMagasin called with:", { dto });
    window.electron.ipcRenderer.send("/magasin/create", { dto });

    window.electron.ipcRenderer.once(
      "/magasin/create",
      (_event, data: CreateMagasinResponse & { error?: string }) => {
        console.log("IPC: createMagasin response:", data);
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get all magasins
export function findAllMagasin(): Promise<Magasin[]> {
  return new Promise((resolve, reject) => {
    console.log("IPC: findAllMagasin called");
    window.electron.ipcRenderer.send("/magasin/getAll");

    window.electron.ipcRenderer.once(
      "/magasin/getAll",
      (_event, data: Magasin[] & { error?: string }) => {
        console.log("IPC: findAllMagasin response:", data);
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Get a single magasin by ID
export function findMagasinById(id: string): Promise<Magasin> {
  return new Promise((resolve, reject) => {
    console.log("IPC: findMagasinById called with:", { id });
    window.electron.ipcRenderer.send("/magasin/getById", { id });

    window.electron.ipcRenderer.once(
      "/magasin/getById",
      (_event, data: Magasin & { error?: string }) => {
        console.log("IPC: findMagasinById response:", data);
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Update a magasin
export function updateMagasinById(id: string, dto: UpdateMagasinDto): Promise<Magasin> {
  return new Promise((resolve, reject) => {
    console.log("IPC: updateMagasinById called with:", { id, dto });
    window.electron.ipcRenderer.send("/magasin/update", { id, dto });

    window.electron.ipcRenderer.once(
      "/magasin/update",
      (_event, data: Magasin & { error?: string }) => {
        console.log("IPC: updateMagasinById response:", data);
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}
