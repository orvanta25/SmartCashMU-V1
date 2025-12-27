import { PrismaClient } from '@prisma/client';

export interface CreateCaisseDto {
  name: string;
  ip: string;
  port: number;
  macAddress?: string;
  isCentral?: boolean;
  storeId?: string;
}

export interface UpdateCaisseDto {
  name?: string;
  ip?: string;
  port?: number;
  macAddress?: string;
  status?: 'online' | 'offline' | 'syncing' | 'error';
  lastSync?: Date;
  isCentral?: boolean;
  version?: string;
}

export class CaisseModel {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.caisse.findMany({
      where: { isActive: true },
      orderBy: [
        { isCentral: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findById(id: string) {
    return this.prisma.caisse.findUnique({
      where: { id }
    });
  }

  async findByIpPort(ip: string, port: number) {
    return this.prisma.caisse.findFirst({
      where: { ip, port }
    });
  }

  async create(data: CreateCaisseDto) {
    // Si c'est une caisse centrale, retirer le statut des autres
    if (data.isCentral) {
      await this.prisma.caisse.updateMany({
        where: { isCentral: true },
        data: { isCentral: false }
      });
    }

    return this.prisma.caisse.create({
      data: {
        ...data,
        status: 'offline'
      }
    });
  }

  async update(id: string, data: UpdateCaisseDto) {
    // Si on définit comme centrale, retirer des autres
    if (data.isCentral) {
      await this.prisma.caisse.updateMany({
        where: { 
          isCentral: true,
          id: { not: id }
        },
        data: { isCentral: false }
      });
    }

    return this.prisma.caisse.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return this.prisma.caisse.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async updateStatus(id: string, status: string, lastSync?: Date) {
    return this.prisma.caisse.update({
      where: { id },
      data: {
        status,
        lastSync: lastSync || new Date()
      }
    });
  }

  async removeCentralStatus() {
    return this.prisma.caisse.updateMany({
      where: { isCentral: true },
      data: { isCentral: false }
    });
  }

  async setCentral(id: string) {
    await this.removeCentralStatus();
    return this.update(id, { isCentral: true });
  }

  async getCentral() {
    return this.prisma.caisse.findFirst({
      where: { 
        isCentral: true,
        isActive: true 
      }
    });
  }
}