import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Line,
  Text as SvgText,
  G,
  Path,
  Defs,
  LinearGradient,
  Stop
} from 'react-native-svg';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface PlexusBrachialisSVGProps {
  diagnosis?: string;
  affectedStructures?: string[];
  width?: number;
  height?: number;
  animated?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export function PlexusBrachialisSVG({ 
  diagnosis, 
  affectedStructures = [], 
  width = screenWidth - 40, 
  height = 300,
  animated = false
}: PlexusBrachialisSVGProps) {
  const { colors } = useThemedStyles();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && affectedStructures.length > 0) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [animated, affectedStructures, pulseAnim]);

  // Mapeo de estructuras a colores según el diagnóstico
  const getStructureColor = (structure: string) => {
    if (affectedStructures.includes(structure)) {
      return colors.error; // Rojo para estructuras afectadas
    }
    return colors.mutedText; // Gris para estructuras normales
  };

  const getStructureOpacity = (structure: string) => {
    if (affectedStructures.includes(structure)) {
      return 1; // Completamente opaco para estructuras afectadas
    }
    return 0.6; // Semi-transparente para estructuras normales
  };

  const getStrokeWidth = (structure: string) => {
    if (affectedStructures.includes(structure)) {
      return 3; // Líneas más gruesas para estructuras afectadas
    }
    return 1.5; // Líneas normales
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 400 300">
        <Defs>
          <LinearGradient id="affectedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.error} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.errorLight || colors.error} stopOpacity={0.7} />
          </LinearGradient>
          
          <LinearGradient id="normalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.mutedText} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={colors.border} stopOpacity={0.4} />
          </LinearGradient>
        </Defs>

        {/* Columna vertebral */}
        <Rect
          x={50}
          y={30}
          width={8}
          height={240}
          fill={colors.mutedText}
          opacity={0.8}
          rx={4}
        />

        {/* Etiquetas de vértebras */}
        <SvgText x={35} y={50} fontSize={10} fill={colors.text} textAnchor="middle">C5</SvgText>
        <SvgText x={35} y={80} fontSize={10} fill={colors.text} textAnchor="middle">C6</SvgText>
        <SvgText x={35} y={110} fontSize={10} fill={colors.text} textAnchor="middle">C7</SvgText>
        <SvgText x={35} y={140} fontSize={10} fill={colors.text} textAnchor="middle">C8</SvgText>
        <SvgText x={35} y={170} fontSize={10} fill={colors.text} textAnchor="middle">T1</SvgText>

        {/* Raíces nerviosas */}
        <G id="nerve-roots">
          {/* C5 */}
          <Line
            x1={58}
            y1={45}
            x2={90}
            y2={45}
            stroke={getStructureColor('c5-path')}
            strokeWidth={getStrokeWidth('c5-path')}
            opacity={getStructureOpacity('c5-path')}
          />
          <Circle
            cx={90}
            cy={45}
            r={3}
            fill={getStructureColor('c5-path')}
            opacity={getStructureOpacity('c5-path')}
          />

          {/* C6 */}
          <Line
            x1={58}
            y1={75}
            x2={90}
            y2={75}
            stroke={getStructureColor('c6-path')}
            strokeWidth={getStrokeWidth('c6-path')}
            opacity={getStructureOpacity('c6-path')}
          />
          <Circle
            cx={90}
            cy={75}
            r={3}
            fill={getStructureColor('c6-path')}
            opacity={getStructureOpacity('c6-path')}
          />

          {/* C7 */}
          <Line
            x1={58}
            y1={105}
            x2={90}
            y2={105}
            stroke={getStructureColor('c7-path')}
            strokeWidth={getStrokeWidth('c7-path')}
            opacity={getStructureOpacity('c7-path')}
          />
          <Circle
            cx={90}
            cy={105}
            r={3}
            fill={getStructureColor('c7-path')}
            opacity={getStructureOpacity('c7-path')}
          />

          {/* C8 */}
          <Line
            x1={58}
            y1={135}
            x2={90}
            y2={135}
            stroke={getStructureColor('c8-path')}
            strokeWidth={getStrokeWidth('c8-path')}
            opacity={getStructureOpacity('c8-path')}
          />
          <Circle
            cx={90}
            cy={135}
            r={3}
            fill={getStructureColor('c8-path')}
            opacity={getStructureOpacity('c8-path')}
          />

          {/* T1 */}
          <Line
            x1={58}
            y1={165}
            x2={90}
            y2={165}
            stroke={getStructureColor('t1-path')}
            strokeWidth={getStrokeWidth('t1-path')}
            opacity={getStructureOpacity('t1-path')}
          />
          <Circle
            cx={90}
            cy={165}
            r={3}
            fill={getStructureColor('t1-path')}
            opacity={getStructureOpacity('t1-path')}
          />
        </G>

        {/* Troncos */}
        <G id="trunks">
          {/* Tronco Superior (C5-C6) */}
          <Path
            d="M 90 45 Q 120 45 130 60 Q 130 75 90 75"
            fill="none"
            stroke={getStructureColor('superior-trunk')}
            strokeWidth={getStrokeWidth('superior-trunk')}
            opacity={getStructureOpacity('superior-trunk')}
          />
          <Circle
            cx={130}
            cy={60}
            r={4}
            fill={getStructureColor('superior-trunk')}
            opacity={getStructureOpacity('superior-trunk')}
          />
          <SvgText x={145} y={65} fontSize={8} fill={colors.text}>Tronco Superior</SvgText>

          {/* Tronco Medio (C7) */}
          <Line
            x1={90}
            y1={105}
            x2={130}
            y2={105}
            stroke={getStructureColor('middle-trunk')}
            strokeWidth={getStrokeWidth('middle-trunk')}
            opacity={getStructureOpacity('middle-trunk')}
          />
          <Circle
            cx={130}
            cy={105}
            r={4}
            fill={getStructureColor('middle-trunk')}
            opacity={getStructureOpacity('middle-trunk')}
          />
          <SvgText x={145} y={110} fontSize={8} fill={colors.text}>Tronco Medio</SvgText>

          {/* Tronco Inferior (C8-T1) */}
          <Path
            d="M 90 135 Q 120 135 130 150 Q 130 165 90 165"
            fill="none"
            stroke={getStructureColor('inferior-trunk')}
            strokeWidth={getStrokeWidth('inferior-trunk')}
            opacity={getStructureOpacity('inferior-trunk')}
          />
          <Circle
            cx={130}
            cy={150}
            r={4}
            fill={getStructureColor('inferior-trunk')}
            opacity={getStructureOpacity('inferior-trunk')}
          />
          <SvgText x={145} y={155} fontSize={8} fill={colors.text}>Tronco Inferior</SvgText>
        </G>

        {/* Fascículos */}
        <G id="cords">
          {/* Fascículo Lateral */}
          <Path
            d="M 130 60 Q 170 70 180 90"
            fill="none"
            stroke={getStructureColor('lateral-cord')}
            strokeWidth={getStrokeWidth('lateral-cord')}
            opacity={getStructureOpacity('lateral-cord')}
          />
          <Path
            d="M 130 105 Q 170 100 180 90"
            fill="none"
            stroke={getStructureColor('lateral-cord')}
            strokeWidth={getStrokeWidth('lateral-cord')}
            opacity={getStructureOpacity('lateral-cord')}
          />
          <Circle
            cx={180}
            cy={90}
            r={5}
            fill={getStructureColor('lateral-cord')}
            opacity={getStructureOpacity('lateral-cord')}
          />
          <SvgText x={195} y={95} fontSize={8} fill={colors.text}>F. Lateral</SvgText>

          {/* Fascículo Posterior */}
          <Path
            d="M 130 60 Q 170 80 180 120"
            fill="none"
            stroke={getStructureColor('posterior-cord')}
            strokeWidth={getStrokeWidth('posterior-cord')}
            opacity={getStructureOpacity('posterior-cord')}
          />
          <Path
            d="M 130 105 Q 170 110 180 120"
            fill="none"
            stroke={getStructureColor('posterior-cord')}
            strokeWidth={getStrokeWidth('posterior-cord')}
            opacity={getStructureOpacity('posterior-cord')}
          />
          <Path
            d="M 130 150 Q 170 140 180 120"
            fill="none"
            stroke={getStructureColor('posterior-cord')}
            strokeWidth={getStrokeWidth('posterior-cord')}
            opacity={getStructureOpacity('posterior-cord')}
          />
          <Circle
            cx={180}
            cy={120}
            r={5}
            fill={getStructureColor('posterior-cord')}
            opacity={getStructureOpacity('posterior-cord')}
          />
          <SvgText x={195} y={125} fontSize={8} fill={colors.text}>F. Posterior</SvgText>

          {/* Fascículo Medial */}
          <Path
            d="M 130 105 Q 170 130 180 150"
            fill="none"
            stroke={getStructureColor('medial-cord')}
            strokeWidth={getStrokeWidth('medial-cord')}
            opacity={getStructureOpacity('medial-cord')}
          />
          <Path
            d="M 130 150 Q 170 150 180 150"
            fill="none"
            stroke={getStructureColor('medial-cord')}
            strokeWidth={getStrokeWidth('medial-cord')}
            opacity={getStructureOpacity('medial-cord')}
          />
          <Circle
            cx={180}
            cy={150}
            r={5}
            fill={getStructureColor('medial-cord')}
            opacity={getStructureOpacity('medial-cord')}
          />
          <SvgText x={195} y={155} fontSize={8} fill={colors.text}>F. Medial</SvgText>
        </G>

        {/* Nervios terminales principales */}
        <G id="terminal-nerves">
          {/* Nervio Axilar */}
          <Line
            x1={180}
            y1={120}
            x2={250}
            y2={80}
            stroke={getStructureColor('axillary')}
            strokeWidth={getStrokeWidth('axillary')}
            opacity={getStructureOpacity('axillary')}
          />
          <SvgText x={260} y={85} fontSize={8} fill={colors.text}>N. Axilar</SvgText>

          {/* Nervio Musculocutáneo */}
          <Line
            x1={180}
            y1={90}
            x2={250}
            y2={70}
            stroke={getStructureColor('musculocutaneous')}
            strokeWidth={getStrokeWidth('musculocutaneous')}
            opacity={getStructureOpacity('musculocutaneous')}
          />
          <SvgText x={260} y={75} fontSize={8} fill={colors.text}>N. Musculocutáneo</SvgText>

          {/* Nervio Radial */}
          <Line
            x1={180}
            y1={120}
            x2={250}
            y2={120}
            stroke={getStructureColor('radial')}
            strokeWidth={getStrokeWidth('radial')}
            opacity={getStructureOpacity('radial')}
          />
          <SvgText x={260} y={125} fontSize={8} fill={colors.text}>N. Radial</SvgText>

          {/* Nervio Mediano */}
          <Line
            x1={180}
            y1={90}
            x2={220}
            y2={140}
            stroke={getStructureColor('median')}
            strokeWidth={getStrokeWidth('median')}
            opacity={getStructureOpacity('median')}
          />
          <Line
            x1={180}
            y1={150}
            x2={220}
            y2={140}
            stroke={getStructureColor('median')}
            strokeWidth={getStrokeWidth('median')}
            opacity={getStructureOpacity('median')}
          />
          <Line
            x1={220}
            y1={140}
            x2={250}
            y2={140}
            stroke={getStructureColor('median')}
            strokeWidth={getStrokeWidth('median')}
            opacity={getStructureOpacity('median')}
          />
          <SvgText x={260} y={145} fontSize={8} fill={colors.text}>N. Mediano</SvgText>

          {/* Nervio Ulnar */}
          <Line
            x1={180}
            y1={150}
            x2={250}
            y2={160}
            stroke={getStructureColor('ulnar')}
            strokeWidth={getStrokeWidth('ulnar')}
            opacity={getStructureOpacity('ulnar')}
          />
          <SvgText x={260} y={165} fontSize={8} fill={colors.text}>N. Ulnar</SvgText>
        </G>

        {/* Nervios supraclaviculares */}
        <G id="supraclavicular-nerves">
          {/* Nervio Supraescapular */}
          <Line
            x1={130}
            y1={60}
            x2={120}
            y2={40}
            stroke={getStructureColor('suprascapular')}
            strokeWidth={getStrokeWidth('suprascapular')}
            opacity={getStructureOpacity('suprascapular')}
          />
          <SvgText x={85} y={35} fontSize={8} fill={colors.text}>N. Supraescapular</SvgText>
        </G>

        {/* Título */}
        <SvgText x={200} y={20} fontSize={12} fill={colors.text} textAnchor="middle" fontWeight="bold">
          Plexo Braquial
        </SvgText>

        {/* Leyenda */}
        <G id="legend" transform="translate(20, 220)">
          <Rect x={0} y={0} width={150} height={60} fill={colors.surface} opacity={0.9} rx={5} />
          <Line x1={10} y1={15} x2={25} y2={15} stroke={colors.error} strokeWidth={3} />
          <SvgText x={30} y={20} fontSize={9} fill={colors.text}>Estructura afectada</SvgText>
          <Line x1={10} y1={35} x2={25} y2={35} stroke={colors.mutedText} strokeWidth={1.5} opacity={0.6} />
          <SvgText x={30} y={40} fontSize={9} fill={colors.text}>Estructura normal</SvgText>
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
