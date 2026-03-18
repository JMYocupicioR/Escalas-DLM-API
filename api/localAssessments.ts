// api/localAssessments.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Assessment } from '@/types/question';

const ASSESSMENT_STORAGE_KEY = 'local_assessments';

/**
 * Guarda una evaluación de forma local solamente
 */
export const saveLocalAssessment = async (assessment: Assessment): Promise<boolean> => {
  try {
    // Generar ID único
    const newAssessment = {
      ...assessment,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      date: new Date()
    };
    
    // Obtener evaluaciones existentes
    const existingString = await AsyncStorage.getItem(ASSESSMENT_STORAGE_KEY);
    const existing: Assessment[] = existingString ? JSON.parse(existingString) : [];
    
    // Guardar la nueva evaluación junto con las existentes
    await AsyncStorage.setItem(
      ASSESSMENT_STORAGE_KEY, 
      JSON.stringify([newAssessment, ...existing])
    );
    
    return true;
  } catch (error) {
    console.error('Error al guardar evaluación localmente:', error);
    return false;
  }
};

/**
 * Elimina evaluaciones almacenadas localmente
 */
export const clearLocalAssessments = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error al eliminar evaluaciones:', error);
    return false;
  }
};