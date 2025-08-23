import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Filter, FeDropShadow, G, Circle, Path } from 'react-native-svg';

interface AppIconProps {
  size?: number;
  style?: any;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 100, style }) => {
  return (
    <View style={style}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
      >
        <Defs>
          {/* Gradiente principal para el ícono */}
          <LinearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0891b2" />
            <Stop offset="100%" stopColor="#06b6d4" />
          </LinearGradient>

          {/* Filtro para una sombra sutil */}
          <Filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <FeDropShadow 
              dx="2" 
              dy="3" 
              stdDeviation="2" 
              floodColor="#000000" 
              floodOpacity="0.2"
            />
          </Filter>
        </Defs>

        <G filter="url(#softShadow)">
          {/* Círculo principal (Diafragma del estetoscopio) */}
          <Circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="url(#iconGradient)"
          />
          
          {/* Anillo interior para dar profundidad */}
          <Circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="none" 
            stroke="white" 
            strokeOpacity="0.2" 
            strokeWidth="1.5"
          />

          {/* Marca de Verificación (Checkmark) */}
          <Path 
            d="M32 50 L45 63 L68 40" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};

// Versión simplificada sin sombra para casos donde el rendimiento es crítico
export const AppIconSimple: React.FC<AppIconProps> = ({ size = 100, style }) => {
  return (
    <View style={style}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
      >
        <Defs>
          <LinearGradient id="iconGradientSimple" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0891b2" />
            <Stop offset="100%" stopColor="#06b6d4" />
          </LinearGradient>
        </Defs>

        {/* Círculo principal */}
        <Circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="url(#iconGradientSimple)"
        />
        
        {/* Anillo interior */}
        <Circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="white" 
          strokeOpacity="0.2" 
          strokeWidth="1.5"
        />

        {/* Marca de Verificación */}
        <Path 
          d="M32 50 L45 63 L68 40" 
          fill="none" 
          stroke="#FFFFFF" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};