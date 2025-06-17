import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scale } from '@/types/scale';

// Interfaces para el almacenamiento
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Assessment {
  id: string;
  scaleId: string;
  patientId: string;
  answers: Record<string, number | string>;
  score: number;
  interpretation?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface ScalesState {
  // Estado existente
  favorites: string[];
  recentlyViewed: string[];
  
  // Nuevo estado
  assessments: Record<string, Assessment>;
  patients: Record<string, Patient>;
  
  // Acciones existentes
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  addRecentlyViewed: (id: string) => void;
  
  // Nuevas acciones
  saveAssessment: (assessment: Assessment) => void;
  getAssessment: (id: string) => Assessment | undefined;
  getAssessmentsByPatient: (patientId: string) => Assessment[];
  getAssessmentsByScale: (scaleId: string) => Assessment[];
  deleteAssessment: (id: string) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  getPatient: (id: string) => Patient | undefined;
  deletePatient: (id: string) => void;
  clear: () => void;
}

// Generador de IDs único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Creación del store con persistencia
export const useScalesStore = create<ScalesState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      favorites: [],
      recentlyViewed: [],
      assessments: {},
      patients: {},
      
      // Implementación de acciones existentes
      addFavorite: (id) => set((state) => ({
        favorites: [...new Set([...state.favorites, id])],
      })),
      
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter((favId) => favId !== id),
      })),
      
      addRecentlyViewed: (id) => set((state) => {
        // Verificar que el ID sea válido
        if (!id) return state;
        
        // Eliminar duplicados y añadir al principio
        const filtered = state.recentlyViewed.filter((viewedId) => viewedId !== id);
        return {
          recentlyViewed: [id, ...filtered].slice(0, 10),
        };
      }),
      
      // Implementación de nuevas acciones
      saveAssessment: (assessment) => set((state) => {
        const now = Date.now();
        const id = assessment.id || generateId();
        
        const updatedAssessment = {
          ...assessment,
          id,
          updatedAt: now,
          createdAt: assessment.createdAt || now,
        };
        
        return {
          assessments: {
            ...state.assessments,
            [id]: updatedAssessment
          }
        };
      }),
      
      getAssessment: (id) => {
        return get().assessments[id];
      },
      
      getAssessmentsByPatient: (patientId) => {
        return Object.values(get().assessments)
          .filter(assessment => assessment.patientId === patientId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },
      
      getAssessmentsByScale: (scaleId) => {
        return Object.values(get().assessments)
          .filter(assessment => assessment.scaleId === scaleId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },
      
      deleteAssessment: (id) => set((state) => {
        const { [id]: _, ...rest } = state.assessments;
        return { assessments: rest };
      }),
      
      addPatient: (patient) => set((state) => {
        const now = Date.now();
        const id = patient.id || generateId();
        
        const newPatient = {
          ...patient,
          id,
          updatedAt: now,
          createdAt: patient.createdAt || now,
        };
        
        return {
          patients: {
            ...state.patients,
            [id]: newPatient
          }
        };
      }),
      
      updatePatient: (id, data) => set((state) => {
        const patient = state.patients[id];
        if (!patient) return state;
        
        const updatedPatient = {
          ...patient,
          ...data,
          updatedAt: Date.now(),
        };
        
        return {
          patients: {
            ...state.patients,
            [id]: updatedPatient
          }
        };
      }),
      
      getPatient: (id) => {
        return get().patients[id];
      },
      
      deletePatient: (id) => set((state) => {
        // Eliminar el paciente
        const { [id]: _, ...restPatients } = state.patients;
        
        // Eliminar también todas las evaluaciones asociadas a este paciente
        const assessments = { ...state.assessments };
        Object.keys(assessments).forEach(assessmentId => {
          if (assessments[assessmentId].patientId === id) {
            delete assessments[assessmentId];
          }
        });
        
        return { 
          patients: restPatients,
          assessments
        };
      }),
      
      clear: () => set({
        favorites: [],
        recentlyViewed: [],
        assessments: {},
        patients: {},
      }),
    }),
    {
      name: 'scales-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        assessments: state.assessments,
        patients: state.patients,
      }),
    }
  )
);