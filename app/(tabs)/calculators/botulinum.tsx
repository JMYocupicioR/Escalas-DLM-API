import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { dosisData, puntosMotoresData } from '@/data/botulinum';
import { PlusCircle, RotateCcw, Trash2, TrendingUp } from 'lucide-react-native';
import { ResultsActions } from '@/components/ResultsActions';

// Define types for state management
type Marca = 'Dysport' | 'Botox' | 'Xeomin' | '';
type DosisOption = 'min' | 'max' | null;
type Lado = 'Izquierdo' | 'Derecho';
type LateralidadOption = Lado | 'Ambos' | '';


interface MusculoSeleccionado {
  id: string;
  nombre: string;
  lado: Lado;
  opcionDosis: DosisOption;
  dosisBase?: number;
  dosisAjustada?: number;
}

export default function BotulinumCalculator() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemedStyles();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // State variables
  const [marca, setMarca] = useState<Marca>('');
  const [medico, setMedico] = useState('');
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [pacientePeso, setPacientePeso] = useState('');
  const [pacienteEdad, setPacienteEdad] = useState('');
  const [dilucion, setDilucion] = useState('');
  const [musculoSeleccionado, setMusculoSeleccionado] = useState('');
  const [lateralidad, setLateralidad] = useState<LateralidadOption>('');
  const [musculos, setMusculos] = useState<MusculoSeleccionado[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [advertencia, setAdvertencia] = useState<string | null>(null);
  const [calculoRealizado, setCalculoRealizado] = useState(false);

  const musculosDisponibles = useMemo(() => {
    return marca ? Object.keys(dosisData[marca]).sort() : [];
  }, [marca]);

  const factorAjuste = useMemo(() => {
    const edad = parseFloat(pacienteEdad);
    const peso = parseFloat(pacientePeso);
    if (!isNaN(edad) && edad < 18 && !isNaN(peso) && peso > 0) {
      return peso / 40;
    }
    return 1.0;
  }, [pacienteEdad, pacientePeso]);

  const totalDosisAjustada = useMemo(() => {
    return musculos.reduce((total, m) => total + (m.dosisAjustada || 0), 0);
  }, [musculos]);

  const handleMarcaChange = (itemValue: Marca) => {
    setMarca(itemValue);
    setMusculos([]);
    setMusculoSeleccionado('');
    setCalculoRealizado(false);
    setError(null);
    setAdvertencia(null);
  };

  const handleAgregarMusculo = () => {
    if (!musculoSeleccionado || !lateralidad) {
      setError('Debe seleccionar un músculo y su lateralidad.');
      return;
    }

    const lados: Lado[] =
      lateralidad === 'Ambos' ? ['Izquierdo', 'Derecho'] : [lateralidad as Lado];
    const nuevosMusculos: MusculoSeleccionado[] = [];
    let errorExistente = false;

    lados.forEach(lado => {
      const id = `${musculoSeleccionado}-${lado}-${Date.now()}`;
      const yaExiste = musculos.some(
        m => m.nombre === musculoSeleccionado && m.lado === lado
      );
      if (yaExiste) {
        errorExistente = true;
      } else {
        nuevosMusculos.push({
          id,
          nombre: musculoSeleccionado,
          lado,
          opcionDosis: null,
        });
      }
    });

    if (errorExistente) {
      setError('Uno o ambos músculos ya han sido agregados.');
    } else {
      setMusculos(prev => [...prev, ...nuevosMusculos]);
      setError(null);
    }
    setCalculoRealizado(false);
  };
  
  const handleEliminarMusculo = (id: string) => {
    setMusculos(prev => prev.filter(m => m.id !== id));
    setCalculoRealizado(false);
  };
  
  const handleOpcionDosisChange = (id: string, opcion: 'min' | 'max') => {
    setMusculos(prev =>
      prev.map(m => (m.id === id ? { ...m, opcionDosis: opcion } : m))
    );
    setCalculoRealizado(false);
  };
  
  const handleDosisAjustadaChange = (id: string, valor: string) => {
    const nuevoValor = parseInt(valor, 10);
    setMusculos(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, dosisAjustada: isNaN(nuevoValor) ? 0 : nuevoValor }
          : m
      )
    );
  };
  
  const handleCalcular = () => {
    setError(null);
    setAdvertencia(null);
    
    if (!marca || musculos.length === 0 || !dilucion || !medico) {
      setError('Por favor, complete todos los campos requeridos (*).');
      return;
    }

    if (musculos.some(m => !m.opcionDosis)) {
      setError('Debe seleccionar una dosis (mínima o máxima) para cada músculo.');
      return;
    }

    const musculosCalculados = musculos.map(m => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const rango = dosisData[marca][m.nombre];
      const dosisBase = m.opcionDosis === 'min' ? rango.min : rango.max;
      const dosisAjustada = Math.round(dosisBase * factorAjuste);
      return { ...m, dosisBase, dosisAjustada };
    });

    setMusculos(musculosCalculados);
    
    const total = musculosCalculados.reduce((acc, curr) => acc + (curr.dosisAjustada || 0), 0);
    const limite = marca === 'Dysport' ? 1000 : 400;

    if (total > limite) {
      setAdvertencia(`Advertencia: La dosis total (${total} U) excede el límite recomendado por sesión (${limite} U para ${marca}).`);
    }

    setCalculoRealizado(true);
  };


  const handleReiniciar = () => {
    Alert.alert(
      'Reiniciar Calculadora',
      '¿Está seguro de que desea borrar todos los datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: () => {
            setMarca('');
            setMedico('');
            setPacienteNombre('');
            setPacientePeso('');
            setPacienteEdad('');
            setDilucion('');
            setMusculos([]);
            setCalculoRealizado(false);
            setError(null);
            setAdvertencia(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderPicker = (
    selectedValue: any,
    onValueChange: (value: any) => void,
    items: { label: string; value: any }[],
    placeholder: string
  ) => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, !selectedValue && { color: colors.mutedText }]}
      >
        <Picker.Item label={placeholder} value="" enabled={false} />
        {items.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Toxina Botulínica' }} />
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Calculadora de Dosis de Toxina Botulínica</Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          {advertencia && <Text style={styles.advertenciaText}>{advertencia}</Text>}

          <View style={styles.card}>
            <Text style={styles.label}>Marca *</Text>
            {renderPicker(
              marca,
              handleMarcaChange,
              [
                { label: 'Dysport (Abobotulinumtoxina A)', value: 'Dysport' },
                { label: 'Botox (Onabotulinumtoxina A)', value: 'Botox' },
                { label: 'Xeomin (Incobotulinumtoxina A)', value: 'Xeomin' },
              ],
              'Seleccione una marca'
            )}

            <Text style={styles.label}>Nombre del médico *</Text>
            <TextInput
              style={styles.input}
              value={medico}
              onChangeText={setMedico}
              placeholder="Nombre completo"
            />
            
            <Text style={styles.label}>Dilución del frasco (ml) *</Text>
            <TextInput
              style={styles.input}
              value={dilucion}
              onChangeText={setDilucion}
              placeholder="Ej: 2.5"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos del Paciente (Opcional)</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={pacienteNombre}
              onChangeText={setPacienteNombre}
              placeholder="Nombre del paciente"
            />
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={pacientePeso}
              onChangeText={setPacientePeso}
              placeholder="Peso en kilogramos"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Edad (años)</Text>
            <TextInput
              style={styles.input}
              value={pacienteEdad}
              onChangeText={setPacienteEdad}
              placeholder="Edad en años"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selección de Músculos</Text>
            <Text style={styles.label}>Músculo *</Text>
            {renderPicker(
              musculoSeleccionado,
              (v) => setMusculoSeleccionado(v),
              musculosDisponibles.map(m => ({ label: m, value: m })),
              marca ? 'Seleccione un músculo' : 'Seleccione una marca primero'
            )}

            <Text style={styles.label}>Lateralidad *</Text>
            {renderPicker(
              lateralidad,
              (v) => setLateralidad(v),
              [
                { label: 'Izquierdo', value: 'Izquierdo' },
                { label: 'Derecho', value: 'Derecho' },
                { label: 'Ambos', value: 'Ambos' },
              ],
              'Seleccione el lado'
            )}
            <TouchableOpacity style={styles.button} onPress={handleAgregarMusculo}>
              <PlusCircle size={18} color={colors.buttonPrimaryText} />
              <Text style={styles.buttonText}>Agregar Músculo</Text>
            </TouchableOpacity>
          </View>

          {musculos.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Músculos Seleccionados</Text>
              {musculos.map(m => (
                <View key={m.id} style={styles.musculoItem}>
                  <View style={styles.musculoHeader}>
                    <Text style={styles.musculoNombre}>{m.nombre} ({m.lado})</Text>
                    <TouchableOpacity onPress={() => handleEliminarMusculo(m.id)}>
                      <Trash2 size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dosisOpciones}>
                    <TouchableOpacity
                      style={[styles.dosisButton, m.opcionDosis === 'min' && styles.dosisButtonSelected]}
                      onPress={() => handleOpcionDosisChange(m.id, 'min')}
                    >
                      <Text style={[styles.dosisButtonText, m.opcionDosis === 'min' && styles.dosisButtonTextSelected]}>Mínima</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dosisButton, m.opcionDosis === 'max' && styles.dosisButtonSelected]}
                      onPress={() => handleOpcionDosisChange(m.id, 'max')}
                    >
                      <Text style={[styles.dosisButtonText, m.opcionDosis === 'max' && styles.dosisButtonTextSelected]}>Máxima</Text>
                    </TouchableOpacity>
                  </View>
                  {calculoRealizado && m.dosisBase !== undefined && (
                    <View style={styles.resultadoMusculo}>
                      <Text>Dosis Base: {m.dosisBase} U</Text>
                      <View style={styles.inputRow}>
                        <Text>Dosis Ajustada (U): </Text>
                        <TextInput
                          style={styles.inputSmall}
                          value={String(m.dosisAjustada)}
                          onChangeText={v => handleDosisAjustadaChange(m.id, v)}
                          keyboardType="numeric"
                        />
                      </View>
                      <Text style={styles.puntoMotorInfo}>
                        <Text style={{fontWeight: 'bold'}}>Punto motor: </Text>
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/*@ts-ignore */}
                        {puntosMotoresData[m.nombre] || 'No disponible.'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.accionesContainer}>
            <TouchableOpacity style={[styles.button, styles.calcularButton]} onPress={handleCalcular}>
              <TrendingUp size={18} color={colors.buttonPrimaryText} />
              <Text style={styles.buttonText}>Calcular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.reiniciarButton]} onPress={handleReiniciar}>
              <RotateCcw size={18} color={colors.buttonPrimaryText} />
              <Text style={styles.buttonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>

          {calculoRealizado && (
            <>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Dosis Total Recomendada:</Text>
                <Text style={styles.resultValue}>{totalDosisAjustada} U</Text>
              </View>
              <ResultsActions
                assessment={{
                  patientData: {
                    name: pacienteNombre,
                    age: pacienteEdad,
                    gender: '',
                    doctorName: medico,
                  },
                  score: totalDosisAjustada,
                  interpretation: advertencia ? `Advertencia: ${advertencia}` : '',
                  answers: musculos.map((m) => ({
                    id: m.id,
                    question: `${m.nombre} (${m.lado})`,
                    label: m.opcionDosis === 'min' ? 'Mínima' : m.opcionDosis === 'max' ? 'Máxima' : '',
                    value: m.dosisAjustada ?? m.dosisBase ?? '',
                    points: m.dosisAjustada ?? '',
                  })),
                }}
                scale={{ id: 'botulinum', name: 'Calculadora de Toxina Botulínica' } as any}
                containerStyle={{ marginTop: 12 }}
              />
            </>
          )}
          
          <Text style={styles.disclaimer}>
            Nota: Esta herramienta es de apoyo y no sustituye la evaluación clínica ni la revisión de la Drug Label Information de cada producto.
            Creada por el Dr. Marcos Yocupicio para la aplicación de Escalas DLM
          </Text>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    label: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      justifyContent: 'center',
    },
    picker: {
      color: colors.text,
      height: 50,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    buttonText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    musculoItem: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    musculoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    musculoNombre: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    dosisOpciones: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 8,
    },
    dosisButton: {
      flex: 1,
      padding: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.buttonSecondary,
      alignItems: 'center',
    },
    dosisButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dosisButtonText: {
      color: colors.buttonSecondaryText,
      fontWeight: '500',
    },
    dosisButtonTextSelected: {
      color: colors.buttonPrimaryText,
    },
    resultadoMusculo: {
      marginTop: 12,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: 12,
    },
    inputSmall: {
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      padding: 8,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      flex: 1,
      marginLeft: 8,
      textAlign: 'center',
    },
    puntoMotorInfo: {
      fontSize: 12,
      fontStyle: 'italic',
      color: colors.mutedText,
      marginTop: 12,
    },
    accionesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 16,
      marginTop: 16,
    },
    calcularButton: {
      backgroundColor: colors.success,
      flex: 1,
    },
    imprimirButton: {
      backgroundColor: colors.info,
      marginTop: 16,
    },
    reiniciarButton: {
      backgroundColor: colors.error,
      flex: 1,
    },
    resultCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    resultLabel: {
      fontSize: 16,
      color: colors.mutedText,
    },
    resultValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 4,
    },
    errorText: {
      color: colors.error,
      marginBottom: 12,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    advertenciaText: {
      color: colors.warning,
      marginBottom: 12,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    disclaimer: {
      fontSize: 12,
      color: colors.mutedText,
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 24,
      paddingHorizontal: 16,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
  });



