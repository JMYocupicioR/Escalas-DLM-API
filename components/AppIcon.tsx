import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

/**
 * AppIcon — Ícono canónico de DeepLux / Escalas DLM
 *
 * Reproduce fielmente el icon.svg raíz:
 *  - Cuadrado redondeado con gradiente azul (#0ea5e9 → #1e3a5f)
 *  - Letras estilizadas "D" y "L" en blanco
 *  - Punto de acento "lux" con gradiente celeste
 *
 * Mantiene los exports AppIcon y AppIconSimple para compatibilidad.
 */

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
        viewBox="0 0 512 512"
        fill="none"
      >
        <Defs>
          {/* Gradiente principal del fondo */}
          <LinearGradient id="dl-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#0ea5e9" />
            <Stop offset="100%" stopColor="#1e3a5f" />
          </LinearGradient>
          {/* Gradiente del punto de acento "lux" */}
          <LinearGradient id="dl-dot" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#38bdf8" />
            <Stop offset="100%" stopColor="#0ea5e9" />
          </LinearGradient>
        </Defs>

        {/* Fondo cuadrado redondeado */}
        <Rect width="512" height="512" rx="108" fill="url(#dl-bg)" />

        {/* Letra D */}
        <Path
          d="M120 112h80c88 0 140 52 140 144s-52 144-140 144h-80V112zm56 48v192h24c60 0 96-36 96-96s-36-96-96-96h-24z"
          fill="white"
          fillOpacity={0.95}
        />

        {/* Letra L */}
        <Path
          d="M296 112h56v232h80v56H296V112z"
          fill="white"
          fillOpacity={0.85}
        />

        {/* Punto de acento — "lux" (luz) */}
        <Circle cx="416" cy="136" r="20" fill="url(#dl-dot)" fillOpacity={0.9} />
      </Svg>
    </View>
  );
};

/**
 * AppIconSimple — Alias de AppIcon (sin sombra separada).
 * Mantenido para compatibilidad con importaciones existentes.
 */
export const AppIconSimple: React.FC<AppIconProps> = (props) => {
  return <AppIcon {...props} />;
};