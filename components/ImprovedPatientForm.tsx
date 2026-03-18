import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, User, Stethoscope, Baby, Info, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';
import { useScaleStyles } from '@/hooks/useScaleStyles';

interface PatientData {
  name: string;
  birthDate: string;
  gestationalAge: string;
  examDate: string;
  headCircumference: string;
  examiner: string;
  chronologicalAge?: string;
  correctedAge?: string;
  correctedAgeMonths?: number;
}

interface ImprovedPatientFormProps {
  scaleId: string;
  onContinue: (data: PatientData) => void;
  initialData?: Partial<PatientData>;
  includeGestationalAge?: boolean;
  includeHeadCircumference?: boolean;
  ageRange?: { min: number; max: number; unit: 'months' | 'years' };
}

export const ImprovedPatientForm: React.FC<ImprovedPatientFormProps> = ({
  scaleId,
  onContinue,
  initialData = {},
  includeGestationalAge = false,
  includeHeadCircumference = false,
  ageRange
}) => {
  const { colors } = useScaleStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [data, setData] = useState<PatientData>({
    name: initialData.name || '',
    birthDate: initialData.birthDate || '',
    gestationalAge: initialData.gestationalAge || '40',
    examDate: initialData.examDate || new Date().toISOString().split('T')[0],
    headCircumference: initialData.headCircumference || '',
    examiner: initialData.examiner || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExamDatePicker, setShowExamDatePicker] = useState(false);
  const [ageInfo, setAgeInfo] = useState<{
    chronologicalAge: string;
    correctedAge: string;
    correctedAgeMonths: number;
    isWithinRange: boolean;
  } | null>(null);

  // Calculate ages when birth date, gestational age, or exam date change
  const calculateAges = useCallback((birthDate: string, gestationalAge: string, examDate: string) => {
    if (!birthDate || !examDate) return null;

    const birth = new Date(birthDate);
    const exam = new Date(examDate);
    const diffTime = Math.abs(exam.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const chronologicalWeeks = Math.floor(diffDays / 7);
    const chronologicalDaysRemainder = diffDays % 7;
    const chronologicalAge = `${chronologicalWeeks} semanas${chronologicalDaysRemainder > 0 ? ` y ${chronologicalDaysRemainder} días` : ''}`;

    let correctedAge = 'No aplica';
    let correctedAgeMonths = diffDays / 30.44;

    if (includeGestationalAge && gestationalAge && parseInt(gestationalAge) < 37) {
      const prematureDays = (40 - parseInt(gestationalAge)) * 7;
      const correctedTotalDays = diffDays - prematureDays;
      const correctedWeeks = Math.floor(correctedTotalDays / 7);
      const correctedDaysRemainder = correctedTotalDays % 7;
      correctedAge = correctedWeeks >= 0
        ? `${correctedWeeks} semanas${correctedDaysRemainder > 0 ? ` y ${correctedDaysRemainder} días` : ''}`
        : 'Edad corregida negativa';
      correctedAgeMonths = correctedTotalDays / 30.44;
    }

    // Check if within age range
    let isWithinRange = true;
    if (ageRange) {
      const ageToCheck = includeGestationalAge && parseInt(gestationalAge) < 37
        ? correctedAgeMonths
        : diffDays / (ageRange.unit === 'months' ? 30.44 : 365.25);

      isWithinRange = ageToCheck >= ageRange.min && ageToCheck <= ageRange.max;
    }

    return {
      chronologicalAge,
      correctedAge,
      correctedAgeMonths,
      isWithinRange
    };
  }, [includeGestationalAge, ageRange]);

  useEffect(() => {
    const ages = calculateAges(data.birthDate, data.gestationalAge, data.examDate);
    setAgeInfo(ages);
  }, [data.birthDate, data.gestationalAge, data.examDate, calculateAges]);

  const validateField = useCallback((field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es requerido';
        } else if (value.length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'birthDate':
        if (!value) {
          newErrors.birthDate = 'La fecha de nacimiento es requerida';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            newErrors.birthDate = 'La fecha de nacimiento no puede ser futura';
          } else if (today.getTime() - birthDate.getTime() > 10 * 365.25 * 24 * 60 * 60 * 1000) {
            newErrors.birthDate = 'La fecha de nacimiento parece muy antigua para esta escala';
          } else {
            delete newErrors.birthDate;
          }
        }
        break;

      case 'gestationalAge':
        if (includeGestationalAge) {
          const weeks = parseInt(value);
          if (!value || isNaN(weeks)) {
            newErrors.gestationalAge = 'La edad gestacional es requerida';
          } else if (weeks < 20 || weeks > 44) {
            newErrors.gestationalAge = 'La edad gestacional debe estar entre 20-44 semanas';
          } else {
            delete newErrors.gestationalAge;
          }
        }
        break;

      case 'headCircumference':
        if (includeHeadCircumference && value) {
          const circumference = parseFloat(value);
          if (isNaN(circumference)) {
            newErrors.headCircumference = 'Debe ser un número válido';
          } else if (circumference < 20 || circumference > 70) {
            newErrors.headCircumference = 'El perímetro cefálico debe estar entre 20-70 cm';
          } else {
            delete newErrors.headCircumference;
          }
        }
        break;

      case 'examiner':
        if (!value.trim()) {
          newErrors.examiner = 'El nombre del examinador es requerido';
        } else {
          delete newErrors.examiner;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, includeGestationalAge, includeHeadCircumference]);

  const updateField = useCallback((field: keyof PatientData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateField('birthDate', dateString);
    }
  }, [updateField]);

  const handleExamDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowExamDatePicker(false);

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateField('examDate', dateString);
    }
  }, [updateField]);

  const validateAllFields = useCallback(() => {
    const requiredFields = ['name', 'birthDate', 'examiner'];
    if (includeGestationalAge) requiredFields.push('gestationalAge');

    let isValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field, data[field as keyof PatientData])) {
        isValid = false;
      }
    });

    return isValid;
  }, [data, validateField, includeGestationalAge]);

  const handleContinue = useCallback(() => {
    // Validaciones básicas
    if (!data.name || !data.examiner || !data.birthDate) {
      Alert.alert(
        'Datos incompletos',
        'Por favor complete el nombre, examinador y fecha de nacimiento antes de continuar.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    if (includeGestationalAge && !data.gestationalAge) {
      Alert.alert(
        'Edad gestacional requerida',
        'Por favor ingrese la edad gestacional para continuar.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    const patientData = {
      ...data,
      chronologicalAge: ageInfo?.chronologicalAge || '',
      correctedAge: ageInfo?.correctedAge || '',
      correctedAgeMonths: ageInfo?.correctedAgeMonths || 0
    };

    if (ageInfo && !ageInfo.isWithinRange && ageRange) {
      Alert.alert(
        'Edad fuera del rango',
        `Esta escala está diseñada para pacientes de ${ageRange.min}-${ageRange.max} ${ageRange.unit === 'months' ? 'meses' : 'años'}. ¿Desea continuar de todos modos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => onContinue(patientData)
          }
        ]
      );
    } else {
      onContinue(patientData);
    }
  }, [data, ageInfo, ageRange, onContinue, includeGestationalAge]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
          <User color={step >= 1 ? 'white' : colors.textSecondary} size={16} />
        </View>
        <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Datos básicos</Text>
      </View>
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
          <Calendar color={step >= 2 ? 'white' : colors.textSecondary} size={16} />
        </View>
        <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Fechas y medidas</Text>
      </View>
      <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
          <CheckCircle color={step >= 3 ? 'white' : colors.textSecondary} size={16} />
        </View>
        <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Revisión</Text>
      </View>
    </View>
  );

  const renderBasicDataStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información del Paciente</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre del paciente *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Ingrese el nombre completo"
          value={data.name}
          onChangeText={(value) => updateField('name', value)}
          autoFocus
        />
        {errors.name && (
          <View style={styles.errorContainer}>
            <AlertCircle color={colors.error} size={16} />
            <Text style={styles.errorText}>{errors.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Examinador *</Text>
        <TextInput
          style={[styles.input, errors.examiner && styles.inputError]}
          placeholder="Nombre del médico o evaluador"
          value={data.examiner}
          onChangeText={(value) => updateField('examiner', value)}
        />
        {errors.examiner && (
          <View style={styles.errorContainer}>
            <AlertCircle color={colors.error} size={16} />
            <Text style={styles.errorText}>{errors.examiner}</Text>
          </View>
        )}
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={[styles.nextButton, (!data.name || !data.examiner || errors.name || errors.examiner) && styles.buttonDisabled]}
          onPress={() => setStep(2)}
          disabled={!data.name || !data.examiner || !!errors.name || !!errors.examiner}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDatesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Fechas y Medidas</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Fecha de nacimiento *</Text>
        <View style={styles.dateInputContainer}>
          <TouchableOpacity
            style={[styles.dateButton, errors.birthDate && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar color={colors.primary} size={20} />
            <Text style={[styles.dateButtonText, { color: data.birthDate ? colors.text : colors.textSecondary }]}>
              {data.birthDate || 'Toque para seleccionar'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.orText}>o</Text>
          <TextInput
            style={[styles.input, { flex: 1 }, errors.birthDate && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={data.birthDate}
            onChangeText={(value) => updateField('birthDate', value)}
          />
        </View>
        {errors.birthDate && (
          <View style={styles.errorContainer}>
            <AlertCircle color={colors.error} size={16} />
            <Text style={styles.errorText}>{errors.birthDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Fecha del examen</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowExamDatePicker(true)}
        >
          <Calendar color={colors.primary} size={20} />
          <Text style={[styles.dateButtonText, { color: data.examDate ? colors.text : colors.textSecondary }]}>
            {data.examDate || 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.inputHelper}>Se usa la fecha actual por defecto</Text>
      </View>

      {includeGestationalAge && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Edad gestacional (semanas) *</Text>
          <TextInput
            style={[styles.input, errors.gestationalAge && styles.inputError]}
            placeholder="40"
            keyboardType="numeric"
            value={data.gestationalAge}
            onChangeText={(value) => updateField('gestationalAge', value)}
          />
          {errors.gestationalAge && (
            <View style={styles.errorContainer}>
              <AlertCircle color={colors.error} size={16} />
              <Text style={styles.errorText}>{errors.gestationalAge}</Text>
            </View>
          )}
          <Text style={styles.inputHelper}>Importante para calcular edad corregida en prematuros</Text>
        </View>
      )}

      {includeHeadCircumference && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Perímetro cefálico (cm)</Text>
          <TextInput
            style={[styles.input, errors.headCircumference && styles.inputError]}
            placeholder="35.5"
            keyboardType="numeric"
            value={data.headCircumference}
            onChangeText={(value) => updateField('headCircumference', value)}
          />
          {errors.headCircumference && (
            <View style={styles.errorContainer}>
              <AlertCircle color={colors.error} size={16} />
              <Text style={styles.errorText}>{errors.headCircumference}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!data.birthDate || !!errors.birthDate || (includeGestationalAge && (!data.gestationalAge || !!errors.gestationalAge))) && styles.buttonDisabled
          ]}
          onPress={() => setStep(3)}
          disabled={!data.birthDate || !!errors.birthDate || (includeGestationalAge && (!data.gestationalAge || !!errors.gestationalAge))}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Revisión de Datos</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Paciente:</Text>
          <Text style={styles.reviewValue}>{data.name}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Examinador:</Text>
          <Text style={styles.reviewValue}>{data.examiner}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Fecha de nacimiento:</Text>
          <Text style={styles.reviewValue}>{data.birthDate}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Fecha del examen:</Text>
          <Text style={styles.reviewValue}>{data.examDate}</Text>
        </View>

        {ageInfo && (
          <>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Edad cronológica:</Text>
              <Text style={styles.reviewValue}>{ageInfo.chronologicalAge}</Text>
            </View>
            {includeGestationalAge && data.gestationalAge && parseInt(data.gestationalAge) < 37 && (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Edad corregida:</Text>
                <Text style={styles.reviewValue}>{ageInfo.correctedAge}</Text>
              </View>
            )}
            {ageRange && !ageInfo.isWithinRange && (
              <View style={styles.warningContainer}>
                <AlertCircle color={colors.warning} size={16} />
                <Text style={styles.warningText}>
                  Edad fuera del rango recomendado ({ageRange.min}-{ageRange.max} {ageRange.unit === 'months' ? 'meses' : 'años'})
                </Text>
              </View>
            )}
          </>
        )}

        {includeGestationalAge && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Edad gestacional:</Text>
            <Text style={styles.reviewValue}>{data.gestationalAge} semanas</Text>
          </View>
        )}

        {includeHeadCircumference && data.headCircumference && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Perímetro cefálico:</Text>
            <Text style={styles.reviewValue}>{data.headCircumference} cm</Text>
          </View>
        )}
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.backButtonText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Iniciar Evaluación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderStepIndicator()}

        {step === 1 && renderBasicDataStep()}
        {step === 2 && renderDatesStep()}
        {step === 3 && renderReviewStep()}
      </ScrollView>

      {/* Simple Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={data.birthDate ? new Date(data.birthDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {showExamDatePicker && (
        <DateTimePicker
          value={data.examDate ? new Date(data.examDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleExamDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepLine: {
    height: 2,
    backgroundColor: colors.border,
    flex: 0.5,
    marginBottom: 24,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  stepContent: {
    paddingHorizontal: 10,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  inputHelper: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  continueButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  reviewCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orText: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
});