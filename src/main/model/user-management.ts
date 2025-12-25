import { UserRole } from "@prisma/client";

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fondcaisse?: number | string | null;
  permissions: string[];
}

export interface CreateEmployeeDto {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  codePin: string;
  permissions?: string[];
  fondcaisse?: number;
}

export interface UpdateEmployeeDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: UserRole;
  codePin?: string;
  isActive?: boolean;
  permissions?: string[];
  fondcaisse?: number;
}

export interface CreateEmployeeResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fondcaisse?: number;
  permissions: string[];
}

export interface DeleteEmployeeResponse {
  message: string;
}

export interface ToggleEmployeeStatusResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fondcaisse?: number;
}
