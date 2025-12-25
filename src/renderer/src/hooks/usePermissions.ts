// hooks/usePermissions.ts
import { useAuth } from "../components/auth/auth-context";

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || user?.role === 'ADMIN';
  };

  const canViewStatistics = hasPermission('VIEW_STATISTICS') || user?.role === 'ADMIN';
  const canViewSales = hasPermission('VIEW_SALES') || user?.role === 'ADMIN';
  const canViewPurchases = hasPermission('VIEW_PURCHASES') || user?.role === 'ADMIN';

  return {
    canViewStatistics,
    canViewSales,
    canViewPurchases,
    hasPermission
  };
};