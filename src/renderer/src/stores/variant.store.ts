import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  VariantFamily, 
  VariantValue, 
  ProductVariant,
  VariantConfiguration,
  VariantValueFormData,
  VariantFamilyFormData
} from '../types/variant.types';
import { variantFamilyApi } from '../api/variant-family.api';
import { variantValueApi } from '../api/variant-value.api';

interface VariantStore {
  // État
  families: VariantFamily[];
  values: VariantValue[];
  productVariants: Record<string, ProductVariant[]>;
  configurations: Record<string, VariantConfiguration>;
  selectedFamily: VariantFamily | null;
  selectedValue: VariantValue | null;

  // Chargement
  loadingFamilies: boolean;
  loadingValues: boolean;
  loadingVariants: boolean;
  error: string | null;

  // Actions pour les familles
  loadFamilies: () => Promise<void>;
  createFamily: (data: VariantFamilyFormData) => Promise<VariantFamily>;
  updateFamily: (id: number, data: Partial<VariantFamilyFormData>) => Promise<VariantFamily>;
  deleteFamily: (id: number) => Promise<void>;
  setSelectedFamily: (family: VariantFamily | null) => void;

  // Actions pour les valeurs
  loadValuesByFamily: (familyId: number) => Promise<void>;
  loadAllValues: () => Promise<void>;
  createValue: (data: VariantValueFormData) => Promise<VariantValue>;
  updateValue: (id: number, data: Partial<VariantValueFormData>) => Promise<VariantValue>;
  deleteValue: (id: number) => Promise<void>;
  setSelectedValue: (value: VariantValue | null) => void;
  getValuesByFamilyId: (familyId: number) => VariantValue[];

  // État utilitaire
  setLoadingFamilies: (loading: boolean) => void;
  setLoadingValues: (loading: boolean) => void;
  setLoadingVariants: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Réinitialisation
  reset: () => void;
}

export const useVariantStore = create<VariantStore>()(
  persist(
    (set, get) => ({
      families: [],
      values: [],
      productVariants: {},
      configurations: {},
      selectedFamily: null,
      selectedValue: null,
      loadingFamilies: false,
      loadingValues: false,
      loadingVariants: false,
      error: null,

      // ==================== FAMILLES ====================
      loadFamilies: async () => {
        set({ loadingFamilies: true, error: null });
        try {
          const families = await variantFamilyApi.findAll();
          console.log('📥 Familles chargées:', families);
          set({ families, loadingFamilies: false });
        } catch (err: any) {
          console.error('❌ Erreur chargement familles:', err);
          set({ error: err.message, loadingFamilies: false });
          throw err;
        }
      },
      
      createFamily: async (data) => {
        set({ loadingFamilies: true, error: null });
        try {
          console.log('🔄 Création de la famille:', data);
          const family = await variantFamilyApi.create(data);
          console.log('✅ Famille créée:', family);
          
          set(state => {
            const newFamilies = [...state.families, family];
            console.log('📊 Store familles mis à jour, total:', newFamilies.length);
            return { 
              families: newFamilies,
              loadingFamilies: false 
            };
          });
          
          return family;
        } catch (err: any) {
          console.error('❌ Erreur création famille:', err);
          set({ error: err.message, loadingFamilies: false });
          throw err;
        }
      },
      
      updateFamily: async (id, data) => {
        set({ loadingFamilies: true, error: null });
        try {
          console.log('🔄 Mise à jour famille ID:', id, data);
          const updated = await variantFamilyApi.update(id, data);
          console.log('✅ Famille mise à jour:', updated);
          
          set(state => ({
            families: state.families.map(f => f.id === id ? updated : f),
            loadingFamilies: false,
            ...(state.selectedFamily?.id === id && { selectedFamily: updated })
          }));
          
          return updated;
        } catch (err: any) {
          console.error('❌ Erreur mise à jour famille:', err);
          set({ error: err.message, loadingFamilies: false });
          throw err;
        }
      },
      
      deleteFamily: async (id) => {
        set({ loadingFamilies: true, error: null });
        try {
          console.log('🗑️ Suppression famille ID:', id);
          await variantFamilyApi.delete(id);
          console.log('✅ Famille supprimée');
          
          set(state => {
            const newFamilies = state.families.filter(f => f.id !== id);
            // Supprimer aussi les valeurs associées
            const newValues = state.values.filter(v => v.variantFamilyId !== id);
            
            console.log('📊 Store mis à jour - Familles:', newFamilies.length, 'Valeurs:', newValues.length);
            
            return {
              families: newFamilies,
              values: newValues,
              loadingFamilies: false,
              ...(state.selectedFamily?.id === id && { selectedFamily: null })
            };
          });
        } catch (err: any) {
          console.error('❌ Erreur suppression famille:', err);
          set({ error: err.message, loadingFamilies: false });
          throw err;
        }
      },
      
      setSelectedFamily: (family) => set({ selectedFamily: family }),

      // ==================== VALEURS ====================
      loadValuesByFamily: async (familyId) => {
        set({ loadingValues: true, error: null });
        try {
          const values = await variantValueApi.findAllByFamily(familyId);
          console.log(`📥 Valeurs chargées pour famille ${familyId}:`, values);
          
          set(state => {
            const otherValues = state.values.filter(v => v.variantFamilyId !== familyId);
            return { values: [...otherValues, ...values], loadingValues: false };
          });
        } catch (err: any) {
          console.error('❌ Erreur chargement valeurs:', err);
          set({ error: err.message, loadingValues: false });
          throw err;
        }
      },
      
      loadAllValues: async () => {
        set({ loadingValues: true, error: null });
        try {
          const values = await variantValueApi.findAll();
          console.log('📥 Toutes les valeurs chargées:', values);
          set({ values, loadingValues: false });
        } catch (err: any) {
          console.error('❌ Erreur chargement valeurs:', err);
          set({ error: err.message, loadingValues: false });
          throw err;
        }
      },
      
      createValue: async (data) => {
        set({ loadingValues: true, error: null });
        try {
          console.log('🔄 Création de la valeur:', data);
          const value = await variantValueApi.create(data);
          console.log('✅ Valeur créée:', value);
          
          set(state => {
            const newValues = [...state.values, value];
            console.log('📊 Store valeurs mis à jour, total:', newValues.length);
            return { 
              values: newValues,
              loadingValues: false 
            };
          });
          
          return value;
        } catch (err: any) {
          console.error('❌ Erreur création valeur:', err);
          set({ error: err.message, loadingValues: false });
          throw err;
        }
      },
      
      updateValue: async (id, data) => {
        set({ loadingValues: true, error: null });
        try {
          console.log('🔄 Mise à jour valeur ID:', id, data);
          const updated = await variantValueApi.update(id, data);
          console.log('✅ Valeur mise à jour:', updated);
          
          set(state => ({
            values: state.values.map(v => v.id === id ? updated : v),
            loadingValues: false,
            ...(state.selectedValue?.id === id && { selectedValue: updated })
          }));
          
          return updated;
        } catch (err: any) {
          console.error('❌ Erreur mise à jour valeur:', err);
          set({ error: err.message, loadingValues: false });
          throw err;
        }
      },
      
      deleteValue: async (id) => {
        set({ loadingValues: true, error: null });
        try {
          console.log('🗑️ Suppression valeur ID:', id);
          await variantValueApi.delete(id);
          console.log('✅ Valeur supprimée');
          
          set(state => {
            const newValues = state.values.filter(v => v.id !== id);
            console.log('📊 Store valeurs mis à jour, total:', newValues.length);
            
            return {
              values: newValues,
              loadingValues: false,
              ...(state.selectedValue?.id === id && { selectedValue: null })
            };
          });
        } catch (err: any) {
          console.error('❌ Erreur suppression valeur:', err);
          set({ error: err.message, loadingValues: false });
          throw err;
        }
      },
      
      setSelectedValue: (value) => set({ selectedValue: value }),
      
      getValuesByFamilyId: (familyId) => {
        return get().values.filter(v => v.variantFamilyId === familyId);
      },

      // ==================== ÉTAT UTILITAIRE ====================
      setLoadingFamilies: (loading) => set({ loadingFamilies: loading }),
      setLoadingValues: (loading) => set({ loadingValues: loading }),
      setLoadingVariants: (loading) => set({ loadingVariants: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Réinitialisation
      reset: () => set({
        families: [],
        values: [],
        productVariants: {},
        configurations: {},
        selectedFamily: null,
        selectedValue: null,
        loadingFamilies: false,
        loadingValues: false,
        loadingVariants: false,
        error: null
      })
    }),
    { 
      name: 'variant-store',
      partialize: (state) => ({ 
        families: state.families
        // Les values ne sont JAMAIS persistées
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Store rechargé depuis localStorage');
          state.values = [];
          console.log('✅ Values réinitialisées');
        }
      }
    }
  )
);