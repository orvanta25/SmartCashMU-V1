// hooks/useVariantFamilies.ts
import { useVariantStore } from '../stores/variant.store';

export const useVariantFamilies = () => {
  const {
    families,
    loadingFamilies: loading,
    error,
    loadFamilies,
    createFamily,
    updateFamily,
    deleteFamily,
    selectedFamily,
    setSelectedFamily,
    setLoadingFamilies,
    setError,
    clearError
  } = useVariantStore();

  return {
    families,
    loading,
    error,
    selectedFamily,
    loadFamilies,
    createFamily,
    updateFamily,
    deleteFamily,
    setSelectedFamily,
    setLoadingFamilies,
    setError,
    clearError
  };
};