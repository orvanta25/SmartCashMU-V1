import { PrismaClient, UserRole } from '@prisma/client';
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateEmployeeResponse,
  DeleteEmployeeResponse,
  ToggleEmployeeStatusResponse,
} from '../model/user-management';

export async function createEmployee(
  data: { dto: CreateEmployeeDto; entrepriseId: string },
  prisma: PrismaClient
): Promise<CreateEmployeeResponse> {
  try {
    const { dto, entrepriseId } = data;

    if (!dto.nom || !dto.prenom  || !dto.telephone || !dto.role || !dto.codePin || !entrepriseId) {
      throw new Error('Missing required parameters');
    }

    const employee = await prisma.user.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        telephone: dto.telephone,
        pin: dto.codePin,
        role: dto.role,
        isActive: true,
        permissions: dto.permissions ? dto.permissions.join(',') : '',
        fondcaisse: dto.fondcaisse ?? null,
        entreprise: { connect: { id: entrepriseId } },
      },
    });

    return {
      id: employee.id,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      email: employee.email ?? '',
      telephone: employee.telephone ?? '',
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      fondcaisse: employee.fondcaisse ? Number(employee.fondcaisse) : undefined,
      permissions: employee.permissions ? employee.permissions.split(',') : [],
    };
  } catch (error) {
    console.error('service/user-management createEmployee: ', error);
    throw error;
  }
}

export async function getAllEmployees(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<Employee[]> {
  try {
    const { entrepriseId } = data;

    const employees = await prisma.user.findMany({
      where: { entrepriseId },
    });

    return employees.map((employee) => ({
      id: employee.id,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      email: employee.email ?? '',
      telephone: employee.telephone ?? '',
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      fondcaisse: employee.fondcaisse ? Number(employee.fondcaisse) : null,
      permissions: employee.permissions ? employee.permissions.split(',') : [],
    }));
  } catch (error) {
    console.error('service/user-management getAllEmployees: ', error);
    throw error;
  }
}

export async function getUsersByRoles(
  data: { entrepriseId: string },
  prisma: PrismaClient
): Promise<Employee[]> {
  try {
    const { entrepriseId } = data;

    const employees = await prisma.user.findMany({
      where: {
        entrepriseId,
        role: { in: [UserRole.ADMIN, UserRole.CAISSIER, UserRole.SERVEUR] },
      },
    });

    return employees.map((employee) => ({
      id: employee.id,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      email: employee.email ?? '',
      telephone: employee.telephone ?? '',
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      fondcaisse: employee.fondcaisse ? Number(employee.fondcaisse) : null,
      permissions: employee.permissions ? employee.permissions.split(',') : [],
    }));
  } catch (error) {
    console.error('service/user-management getUsersByRoles: ', error);
    throw error;
  }
}

export async function updateEmployee(
  data: { employeeId: string; dto: UpdateEmployeeDto; entrepriseId: string },
  prisma: PrismaClient
): Promise<Employee> {
  try {
    const { employeeId, dto, entrepriseId } = data;

    const employee = await prisma.user.update({
      where: { id: employeeId, entrepriseId },
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email,
        telephone: dto.telephone,
        role: dto.role,
        pin: dto.codePin,
        isActive: dto.isActive,
        permissions: dto.permissions ? dto.permissions.join(',') : undefined,
        fondcaisse: dto.fondcaisse !== undefined ? dto.fondcaisse : undefined,
      },
    });

    return {
      id: employee.id,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      email: employee.email ?? '',
      telephone: employee.telephone ?? '',
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      fondcaisse: employee.fondcaisse ? Number(employee.fondcaisse) : null,
      permissions: employee.permissions ? employee.permissions.split(',') : [],
    };
  } catch (error) {
    console.error('service/user-management updateEmployee: ', error);
    throw error;
  }
}

export async function deleteEmployee(
  data: { employeeId: string; entrepriseId: string },
  prisma: PrismaClient
): Promise<DeleteEmployeeResponse> {
  try {
    const { employeeId, entrepriseId } = data;

    await prisma.user.delete({
      where: { id: employeeId, entrepriseId },
    });

    return { message: 'Employee deleted successfully' };
  } catch (error) {
    console.error('service/user-management deleteEmployee: ', error);
    throw error;
  }
}

export async function toggleEmployeeStatus(
  data: { employeeId: string; isActive: boolean; entrepriseId: string },
  prisma: PrismaClient
): Promise<ToggleEmployeeStatusResponse> {
  try {
    const { employeeId, isActive, entrepriseId } = data;

    const employee = await prisma.user.update({
      where: { id: employeeId, entrepriseId },
      data: { isActive },
    });

    return {
      id: employee.id,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      email: employee.email ?? '',
      telephone: employee.telephone ?? '',
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      fondcaisse: employee.fondcaisse ? Number(employee.fondcaisse) : undefined,
    };
  } catch (error) {
    console.error('service/user-management toggleEmployeeStatus: ', error);
    throw error;
  }
}

export async function getEmployeeById(
  data: { id: string; entrepriseId: string },
  prisma: PrismaClient
): Promise<Employee> {
  try {
    const { id, entrepriseId } = data;

    const employee = await prisma.user.findFirst({
      where: { id, entrepriseId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return {
      id: employee.id,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      email: employee.email ?? '',
      telephone: employee.telephone ?? '',
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      fondcaisse: employee.fondcaisse ? Number(employee.fondcaisse) : null,
      permissions: employee.permissions ? employee.permissions.split(',') : [],
    };
  } catch (error) {
    console.error('service/user-management getEmployeeById: ', error);
    throw error;
  }
}