 import { ipcMain } from 'electron';
import * as service from '../service/user-management';

// Assume a function to get the current user's entrepriseId (e.g., from session or auth context)
import { getCurrentUser } from '../service/auth'; // Hypothetical auth module


export function UserManagementApi(prisma,ses=null) {
   

ipcMain.on('/employee/create', async (event, data) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.createEmployee({ dto: data.dto, entrepriseId }, prisma);
    event.sender.send('/employee/create', { response: result });
  } catch (error: any) {
    console.error('api/user-management /employee/create: ', error);
    event.sender.send('/employee/create', { error: error.message });
  }
});

ipcMain.on('/employee/all', async (event,_: {}) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.getAllEmployees({ entrepriseId }, prisma);
    event.sender.send('/employee/all', { employees: result });
  } catch (error: any) {
    console.error('api/user-management /employee/all: ', error);
    event.sender.send('/employee/all', { error: error.message });
  }
});

ipcMain.on('/employee/by-roles', async (event, _: {}) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.getUsersByRoles({ entrepriseId }, prisma);
    event.sender.send('/employee/by-roles', { employees: result });
  } catch (error: any) {
    console.error('api/user-management /employee/by-roles: ', error);
    event.sender.send('/employee/by-roles', { error: error.message });
  }
});

ipcMain.on('/employee/update', async (event, data) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.updateEmployee({ employeeId: data.employeeId, dto: data.dto, entrepriseId }, prisma);
    event.sender.send('/employee/update', { employee: result });
  } catch (error: any) {
    console.error('api/user-management /employee/update: ', error);
    event.sender.send('/employee/update', { error: error.message });
  }
});

ipcMain.on('/employee/delete', async (event, data: { employeeId: string }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.deleteEmployee({ employeeId: data.employeeId, entrepriseId }, prisma);
    event.sender.send('/employee/delete', { response: result });
  } catch (error: any) {
    console.error('api/user-management /employee/delete: ', error);
    event.sender.send('/employee/delete', { error: error.message });
  }
});

ipcMain.on('/employee/toggle-status', async (event, data: { employeeId: string; isActive: boolean }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.toggleEmployeeStatus({ employeeId: data.employeeId, isActive: data.isActive, entrepriseId }, prisma);
    event.sender.send('/employee/toggle-status', { response: result });
  } catch (error: any) {
    console.error('api/user-management /employee/toggle-status: ', error);
    event.sender.send('/employee/toggle-status', { error: error.message });
  }
});

ipcMain.on('/employee/get-by-id', async (event, data: { id: string }) => {
  try {
    const currentUser = await getCurrentUser(prisma,ses); // Fetch current entrepriseId
    if(!currentUser)throw 'try to login in as ADMIN'
    const { entrepriseId } = currentUser
    const result = await service.getEmployeeById({ id: data.id, entrepriseId }, prisma);
    event.sender.send('/employee/get-by-id', { employee: result });
  } catch (error: any) {
    console.error('api/user-management /employee/get-by-id: ', error);
    event.sender.send('/employee/get-by-id', { error: error.message });
  }
});
}