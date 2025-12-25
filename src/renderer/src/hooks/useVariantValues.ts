import { useVariantStore } from '../stores/variant.store';

export const useVariantValues = (familyId?: number) => {
  const { 
    values,
    loadingValues,
    error,
    loadValuesByFamily,
    loadAllValues,
    createValue,
    updateValue,
    deleteValue,
    getValuesByFamilyId
  } = useVariantStore();

  // Filtrer selon la famille
  const filteredValues = familyId ? getValuesByFamilyId(familyId) : values;

  // Charge automatiquement toutes les valeurs si familyId n’est pas fourni
  // ou les valeurs d’une famille si familyId est défini
  return {
    values: filteredValues,
    loading: loadingValues,
    error,
    loadValuesByFamily,
    loadAllValues,
    createValue,
    updateValue,
    deleteValue
  };
};
