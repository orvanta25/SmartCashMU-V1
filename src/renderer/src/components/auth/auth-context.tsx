'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile, UserProfile } from '../../api/user';
import {  logout,refresh} from '../../api/auth';
import { createEmployee, getAllEmployees, updateEmployee, deleteEmployee, toggleEmployeeStatus, Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../../api/user-management';

interface AuthContextType {
  user: UserProfile | null;
  entreprise: UserProfile['entreprise'] | null;
  employees: Employee[] | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setEntreprise: (entreprise: UserProfile['entreprise'] | null) => void;
  setEmployees: (employees: Employee[] | null) => void;
  logout: () => Promise<void>;
  createEmployee: (dto: CreateEmployeeDto) => Promise<void>;
  fetchEmployees: () => Promise<void>;
  updateEmployee: (employeeId: string, dto: UpdateEmployeeDto) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  toggleEmployeeStatus: (employeeId: string, isActive: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entreprise, setEntreprise] = useState<UserProfile['entreprise'] | null>(null);
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useNavigate();
  const {pathname} = useLocation();

  let isRefreshing = false;
const fetchProfile = async () => {
    if (isRefreshing) return;
    setLoading(true);

    try {
      const response = await getUserProfile();
      console.log("response data in provider page",response)
      setUser(response);
      console.log("response data in provider page",response.entreprise)
      setEntreprise(response.entreprise || null);
    } catch (error: any) {
      if (error.response?.status === 401) {
        isRefreshing = true;
        try {
          await refresh();
          const retryResponse = await getUserProfile();
          setUser(retryResponse);
          setEntreprise(retryResponse.entreprise || null);

        } catch (refreshError) {
          await handleLogout();
        } finally {
          isRefreshing = false;
        }
      } else {
        await handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const protectedPrefixes = ['/dashboard', '/dashboard_user', '/pos'];
  console.log("pathname from authprovider: ", pathname);

  const shouldFetch = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (shouldFetch) {
    console.log("fetchProfile triggered in provider");
    fetchProfile();
  } else {
    setLoading(false);
  }
}, [pathname]);



  useEffect(() => {
    if (user && user.role === 'ADMIN' && pathname !== '/pos' && pathname !== '/') {
      fetchEmployees();
    }
  }, [user, pathname]);

  
  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployees();
      setEmployees(response);
    } catch (error: any) {
      console.error('Failed to fetch employees:', error);
      setEmployees(null);
      if (pathname !== '/') {
        await handleLogout();
      }
    }
  };

  const handleCreateEmployee = async (dto: CreateEmployeeDto) => {
    try {
      await createEmployee(dto);
      await fetchEmployees();
    } catch (error: any) {
      console.error('Create employee failed:', error);
      throw error;
    }
  };

  const handleUpdateEmployee = async (employeeId: string, dto: UpdateEmployeeDto) => {
    try {
      await updateEmployee(employeeId, dto);
      await fetchEmployees();
    } catch (error: any) {
      console.error('Update employee failed:', error);
      throw error;
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
      await fetchEmployees();
    } catch (error: any) {
      console.error('Delete employee failed:', error);
      throw error;
    }
  };

  const handleToggleEmployeeStatus = async (employeeId: string, isActive: boolean) => {
    try {
      await toggleEmployeeStatus(employeeId, isActive);
      await fetchEmployees();
    } catch (error: any) {
      console.error('Toggle employee status failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setEntreprise(null);
      setEmployees(null);
      if (pathname !== '/') {
        router('/');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        entreprise,
        employees,
        loading,
        setUser,
        setEntreprise,
        setEmployees,
        logout: handleLogout,
        createEmployee: handleCreateEmployee,
        fetchEmployees,
        updateEmployee: handleUpdateEmployee,
        deleteEmployee: handleDeleteEmployee,
        toggleEmployeeStatus: handleToggleEmployeeStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};