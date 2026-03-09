import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { AppIcon } from '../AppIcon';

/**
 * EscalasDLMLogo — Componente de marca unificado (React Native)
 *
 * Jerarquía:  DeepLux.org  →  MED  →  Escalas DLM
 *
 * Variantes:
 *  full    → sidebar expandido / uso general
 *  compact → sidebar colapsado / sólo ícono
 *  auth    → pantalla de login/registro, centrado y grande
 *  header  → barra superior móvil, horizontal compacto
 */

interface EscalasDLMLogoProps {
  variant?: 'full' | 'compact' | 'auth' | 'header';
  showProduct?: boolean;
  style?: any;
}

const COLORS = {
  brand: '#f8fafc',
  brandMuted: 'rgba(248,250,252,0.7)',
  accent: '#38bdf8',
  accentMuted: 'rgba(56,189,248,0.6)',
  accentBg: 'rgba(14,165,233,0.12)',
};

const handlePress = () => Linking.openURL('https://deeplux.org');

/* ─────── Compact: sólo ícono ─────── */
function CompactLogo({ style }: { style?: any }) {
  return (
    <Pressable onPress={handlePress} style={style} accessibilityLabel="Visitar deeplux.org">
      <AppIcon size={36} />
    </Pressable>
  );
}

/* ─────── Auth: centrado grande ─────── */
function AuthLogo({ showProduct, style }: { showProduct: boolean; style?: any }) {
  return (
    <Pressable onPress={handlePress} style={[styles.authContainer, style]}>
      <AppIcon size={72} />
      {/* DeepLux.org */}
      <View style={styles.authBrandRow}>
        <Text style={styles.authBrand}>DeepLux</Text>
        <Text style={styles.authOrg}>.org</Text>
      </View>
      {/* MED */}
      <View style={styles.authMedRow}>
        <View style={styles.divider} />
        <Text style={styles.med}>MED</Text>
        <View style={styles.divider} />
      </View>
      {/* Escalas DLM */}
      {showProduct && (
        <View style={styles.authProductRow}>
          <Text style={styles.authProduct}>Escalas</Text>
          <View style={styles.dlmBadge}>
            <Text style={styles.dlmText}>DLM</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

/* ─────── Header: horizontal compacto ─────── */
function HeaderLogo({ style }: { style?: any }) {
  return (
    <Pressable onPress={handlePress} style={[styles.headerContainer, style]} accessibilityLabel="Escalas DLM — Visitar deeplux.org">
      <AppIcon size={28} />
      <View>
        <Text style={styles.headerProduct}>
          Escalas <Text style={styles.headerDlm}>DLM</Text>
        </Text>
        <Text style={styles.headerBrand}>DeepLux<Text style={styles.headerOrg}>.org</Text></Text>
      </View>
    </Pressable>
  );
}

/* ─────── Full: sidebar expandido ─────── */
function FullLogo({ showProduct, style }: { showProduct: boolean; style?: any }) {
  return (
    <View style={[styles.fullContainer, style]}>
      <Pressable onPress={handlePress} style={styles.fullTopRow}>
        <AppIcon size={32} />
        <View style={styles.fullTextStack}>
          <View style={styles.brandRow}>
            <Text style={styles.fullBrand}>DeepLux</Text>
            <Text style={styles.fullOrg}>.org</Text>
          </View>
          <View style={styles.medBadge}>
            <Text style={styles.medBadgeText}>MED</Text>
          </View>
        </View>
      </Pressable>
      {showProduct && (
        <View style={styles.fullProductRow}>
          <View style={styles.fullDivider} />
          <Text style={styles.fullProduct}>
            Escalas <Text style={styles.fullDlm}>DLM</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

/* ─────── Main export ─────── */
export default function EscalasDLMLogo({
  variant = 'full',
  showProduct = true,
  style,
}: EscalasDLMLogoProps) {
  if (variant === 'compact') return <CompactLogo style={style} />;
  if (variant === 'auth') return <AuthLogo showProduct={showProduct} style={style} />;
  if (variant === 'header') return <HeaderLogo style={style} />;
  return <FullLogo showProduct={showProduct} style={style} />;
}

/* ──────────────── Styles ──────────────── */
const styles = StyleSheet.create({
  /* Auth */
  authContainer: {
    alignItems: 'center',
    gap: 8,
  },
  authBrandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  authBrand: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.brand,
    letterSpacing: 0.3,
  },
  authOrg: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.accent,
  },
  authMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    width: 20,
    backgroundColor: COLORS.accentMuted,
  },
  med: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 3,
  },
  authProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  authProduct: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.brand,
  },
  dlmBadge: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dlmText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 2,
  },

  /* Header */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerProduct: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand,
    lineHeight: 18,
  },
  headerDlm: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.accent,
  },
  headerBrand: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.brandMuted,
    lineHeight: 14,
  },
  headerOrg: {
    color: COLORS.accent,
  },

  /* Full */
  fullContainer: {
    gap: 4,
  },
  fullTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullTextStack: {
    gap: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fullBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brandMuted,
    letterSpacing: 0.2,
  },
  fullOrg: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentMuted,
  },
  medBadge: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  medBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  fullProductRow: {
    paddingLeft: 40,
    gap: 4,
  },
  fullDivider: {
    height: 1,
    backgroundColor: COLORS.accentMuted,
    marginBottom: 4,
  },
  fullProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brand,
    letterSpacing: 0.3,
  },
  fullDlm: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
});
