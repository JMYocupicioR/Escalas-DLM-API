import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS,
  SlideInUp,
  SlideOutUp
} from 'react-native-reanimated';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide?: () => void;
  visible: boolean;
}

export function Toast({ 
  type, 
  title, 
  message, 
  duration = 3000, 
  onHide,
  visible 
}: ToastProps) {
  const { colors } = useThemedStyles();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1);
      
      if (duration > 0) {
        opacity.value = withDelay(
          duration,
          withSpring(0, {}, () => {
            if (onHide) {
              runOnJS(onHide)();
            }
          })
        );
      }
    } else {
      opacity.value = withSpring(0);
    }
  }, [visible, duration, onHide, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <Info size={20} color="#0891b2" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      default:
        return '#f0f9ff';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#0891b2';
    }
  };

  if (!visible) return null;

  const styles = createStyles(colors, getBackgroundColor(), getBorderColor());

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(200)}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Animated.View>
  );
}

// Toast Manager Hook
import { create } from 'zustand';

interface ToastState {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>;
  showToast: (toast: Omit<ToastState['toasts'][0], 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  showToast: (toast) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    
    // Auto hide after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, toast.duration || 3000);
  },
  
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Toast Container Component
export function ToastContainer() {
  const { toasts, hideToast } = useToastStore();

  return (
    <View style={toastContainerStyles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          visible={true}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: any, backgroundColor: string, borderColor: string) => StyleSheet.create({
  container: {
    backgroundColor: backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: borderColor,
    marginHorizontal: 16,
    marginVertical: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 16,
  },
});

const toastContainerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10000,
    pointerEvents: 'none',
  },
});
