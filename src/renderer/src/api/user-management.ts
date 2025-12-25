

export enum UserRole {
  ADMIN = 'ADMIN',
  CAISSIER = 'CAISSIER',
  COMPTABLE = 'COMPTABLE',
  GERANT = 'GERANT',
  MAGASINIER = 'MAGASINIER',
  CHEF_RAYON = 'CHEF_RAYON',
  SERVEUR = 'SERVEUR',
}

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

interface CreateEmployeeResponse {
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

interface DeleteEmployeeResponse {
  message: string;
}

interface ToggleEmployeeStatusResponse {
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

// Create a new employee
export function createEmployee(dto: CreateEmployeeDto): Promise<CreateEmployeeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/create", { dto });

    window.electron.ipcRenderer.once(
      "/employee/create",
      (_event, data: { response?: CreateEmployeeResponse; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.response!);
      }
    );
  });
}

// Get all employees for the entreprise
export function getAllEmployees(): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/all");

    window.electron.ipcRenderer.once(
      "/employee/all",
      (_event, data: { employees?: Employee[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.employees!);
      }
    );
  });
}

// Get users with roles ADMIN, CAISSIER, or SERVEUR
export function getUsersByRoles(): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/by-roles");

    window.electron.ipcRenderer.once(
      "/employee/by-roles",
      (_event, data: { employees?: Employee[]; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.employees!);
      }
    );
  });
}

// Update an employee
export function updateEmployee(
  employeeId: string,
  dto: UpdateEmployeeDto
): Promise<Employee> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/update", { employeeId, dto });

    window.electron.ipcRenderer.once(
      "/employee/update",
      (_event, data: { employee?: Employee; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.employee!);
      }
    );
  });
}

// Delete an employee
export function deleteEmployee(employeeId: string): Promise<DeleteEmployeeResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/delete", { employeeId });

    window.electron.ipcRenderer.once(
      "/employee/delete",
      (_event, data: { response?: DeleteEmployeeResponse; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.response!);
      }
    );
  });
}

// Toggle employee active status
export function toggleEmployeeStatus(
  employeeId: string,
  isActive: boolean
): Promise<ToggleEmployeeStatusResponse> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/toggle-status", { employeeId, isActive });

    window.electron.ipcRenderer.once(
      "/employee/toggle-status",
      (_event, data: { response?: ToggleEmployeeStatusResponse; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.response!);
      }
    );
  });
}

// Get a single employee by ID
export function getEmployeeById(id: string): Promise<Employee> {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.send("/employee/get-by-id", { id });

    window.electron.ipcRenderer.once(
      "/employee/get-by-id",
      (_event, data: { employee?: Employee; error?: string }) => {
        if (data.error) reject(data);
        else resolve(data.employee!);
      }
    );
  });
}
