import { CaisseModel, CreateCaisseDto, UpdateCaisseDto } from '../model/caisse.model';
import { PrismaClient } from '@prisma/client';

export class CaisseService {
  private caisseModel: CaisseModel;

  constructor(private prisma: PrismaClient) {
    this.caisseModel = new CaisseModel(prisma);
  }

  async getAllCaisses() {
    return this.caisseModel.findAll();
  }

  async getCaisseById(id: string) {
    const caisse = await this.caisseModel.findById(id);
    if (!caisse) {
      throw new Error('Caisse introuvable');
    }
    return caisse;
  }

  async createCaisse(data: CreateCaisseDto) {
    // Vérifier si IP:Port existe déjà
    const existing = await this.caisseModel.findByIpPort(data.ip, data.port);
    if (existing) {
      throw new Error(`Une caisse existe déjà à l'adresse ${data.ip}:${data.port}`);
    }

    return this.caisseModel.create(data);
  }

  async updateCaisse(id: string, data: UpdateCaisseDto) {
    await this.getCaisseById(id); // Vérifier existence
    return this.caisseModel.update(id, data);
  }

  async deleteCaisse(id: string) {
    const caisse = await this.getCaisseById(id);
    
    // Ne pas supprimer une caisse centrale
    if (caisse.isCentral) {
      throw new Error('Impossible de supprimer une caisse centrale');
    }

    return this.caisseModel.delete(id);
  }

  async updateCaisseStatus(id: string, status: string) {
    return this.caisseModel.updateStatus(id, status);
  }

  async setCentralCaisse(id: string) {
    await this.getCaisseById(id); // Vérifier existence
    return this.caisseModel.setCentral(id);
  }

  async removeCentralStatus() {
    return this.caisseModel.removeCentralStatus();
  }

  async getCentralCaisse() {
    return this.caisseModel.getCentral();
  }

  async testCaisseConnection(caisseId: string): Promise<{
    status: 'online' | 'offline';
    version?: string;
    latency?: number;
  }> {
    const caisse = await this.getCaisseById(caisseId);
    const startTime = Date.now();

    try {
      const response = await fetch(`http://${caisse.ip}:${caisse.port}/health`, {
        signal: AbortSignal.timeout(5000)
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        // Mettre à jour le statut
        await this.caisseModel.updateStatus(caisseId, 'online', new Date());

        return {
          status: 'online',
          version: data.version,
          latency
        };
      }

      await this.caisseModel.updateStatus(caisseId, 'offline');
      return { status: 'offline' };
    } catch (error) {
      await this.caisseModel.updateStatus(caisseId, 'offline');
      return { status: 'offline' };
    }
  }
}
