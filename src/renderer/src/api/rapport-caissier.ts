// Types pour le rapport par caissier
export interface GenerateRapportCaissierDto {
  caissiers: Array<{
    nom: string;
  }>;
  dateOuverture?: string;
  dateFermeture?: string;
  periode?: string;
  includeDetails?: boolean;
}

export interface RapportCaissierResponse {
  rapports: Array<{
    nom: string;
    nombreVentes: number;
    montantTotal: number;
    totalRemises: number;
    totalRetours: number;
    totalNet: number;
    fondCaisse: number;
    totalEncaissements: number;
    paiements: {
      especes: number;
      carte: number;
      cheque: number;
      ticketRestaurant: number;
    };
  }>;
  periode: string;
  dateGeneration: string;
  totalGeneral: {
    nombreVentes: number;
    montantTotal: number;
    totalRemises: number;
    totalRetours: number;
    totalNet: number;
  };
}

// Générer un rapport par caissier
export function generateRapportCaissier(
  dto: GenerateRapportCaissierDto
): Promise<RapportCaissierResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/rapport-caissier/generate", dto);

    window.electron.ipcRenderer.once(
      "/rapport-caissier/generate",
      (_, data: RapportCaissierResponse & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}

// Générer un rapport pour un caissier spécifique
export function generateRapportCaissierUnique(data: {
  caissier: string;
  startDate?: string;
  endDate?: string;
  includeDetails?: boolean;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/rapport-caissier/generateUnique", data);

    window.electron.ipcRenderer.once(
      "/rapport-caissier/generateUnique",
      (_, data: any & { error?: string }) => {
        if (data.error) reject(data);
        else resolve(data);
      }
    );
  });
}