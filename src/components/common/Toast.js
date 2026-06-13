import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, fontSize, fontWeight, spacing, borderRadius} from '../../theme';

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({children}) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const show = useCallback((message, type = 'success', duration = 2800) => {
    // Clear any running timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({message, type});

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration + 600);
  }, [opacity]);

  const bg = {
    success: colors.success,
    error: colors.error,
    info: colors.primary,
    warning: colors.warning,
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <ToastContext.Provider value={{show}}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {opacity, backgroundColor: bg[toast.type] ?? colors.primary},
          ]}
          pointerEvents="none">
          <Text style={styles.icon}>{icons[toast.type] ?? 'ℹ️'}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 18,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    lineHeight: 18,
  },
});