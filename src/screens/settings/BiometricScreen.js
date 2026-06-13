import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';
import {useAuth} from '../../context/AuthContext';
import {
  saveBiometricCredential,
  clearBiometricCredential,
  getAvailableBiometryType,
} from '../../utils/biometrics';

const BIOMETRIC_ENABLED_KEY = 'cabank_biometric_enabled';

const BIOMETRIC_TYPES = [
  {
    id: 'fingerprint',
    icon: 'fingerprint',
    label: 'Fingerprint',
    sub: 'Use your fingerprint to sign in quickly and securely.',
  },
  {
    id: 'faceid',
    icon: 'face-recognition',
    label: 'Face ID',
    sub: 'Use facial recognition to verify your identity.',
  },
];

const PinDot = ({filled}) => (
  <View style={[styles.pinDot, filled && styles.pinDotFilled]} />
);

const BiometricScreen = ({navigation}) => {
  const {getRefreshToken} = useAuth();
  const [enabled, setEnabled] = useState({fingerprint: false, faceid: false});
  const [activating, setActivating] = useState(null);
  const [pin, setPin] = useState('');
  const [pinStep, setPinStep] = useState('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        if (val) setEnabled(JSON.parse(val));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (activating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.12, duration: 600, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [activating, pulseAnim]);

  const persistEnabled = async (next) => {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(next));
  };

  const handleToggle = async (id, value) => {
    if (value) {
      // Check sensor is available and enrolled before proceeding
      const type = await getAvailableBiometryType();
      if (!type) {
        Alert.alert(
          'No biometric sensor found',
          'Please enroll a fingerprint in your device Settings → Security → Fingerprint first, then try again.',
        );
        return;
      }
      setActivating(id);
      setPin('');
      setPinStep('enter');
      setFirstPin('');
      setPinError('');
      setPinSuccess(false);
    } else {
      const next = {...enabled, [id]: false};
      setEnabled(next);
      persistEnabled(next);
      if (!Object.values(next).some(Boolean)) {
        clearBiometricCredential();
      }
    }
  };

  const handlePinPress = digit => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setPinError('');

    if (next.length === 6) {
      setTimeout(async () => {
        if (pinStep === 'enter') {
          setFirstPin(next);
          setPin('');
          setPinStep('confirm');
        } else {
          if (next === firstPin) {
            const nextEnabled = {...enabled, [activating]: true};
            setEnabled(nextEnabled);
            setPinSuccess(true);

            try {
              const token = await getRefreshToken();
              await saveBiometricCredential(token);
              await persistEnabled(nextEnabled);
            } catch (err) {
              console.warn('Failed to save biometric credential:', err.message);
            }

            setTimeout(() => {
              setActivating(null);
              setPinSuccess(false);
              setPin('');
            }, 1500);
          } else {
            setPinError("PINs don't match. Try again.");
            setPin('');
            setPinStep('enter');
            setFirstPin('');
          }
        }
      }, 200);
    }
  };

  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const DIGITS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  const getAnyEnabled = () => Object.values(enabled).some(Boolean);

  if (activating) {
    const bio = BIOMETRIC_TYPES.find(b => b.id === activating);
    return (
      <ScreenWrapper
        title={`Enable ${bio.label}`}
        onBack={() => setActivating(null)}>

        <Animated.View style={[styles.bioIconWrap, {transform: [{scale: pulseAnim}]}]}>
          <Icon name={bio.icon} size={48} color={colors.primary} />
        </Animated.View>

        <View style={styles.pinPromptRow}>
          {pinSuccess && (
            <Icon name="check-circle" size={20} color={colors.success} style={{marginRight: 6}} />
          )}
          <Text style={styles.pinPrompt}>
            {pinSuccess
              ? 'Biometric enabled!'
              : pinStep === 'enter'
              ? 'Create a 6-digit backup PIN'
              : 'Confirm your PIN'}
          </Text>
        </View>
        <Text style={styles.pinSub}>
          {pinSuccess
            ? `You can now use ${bio.label} to sign in.`
            : 'This PIN will be used if biometric fails.'}
        </Text>

        {!pinSuccess && (
          <>
            <View style={styles.pinDots}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <PinDot key={i} filled={pin.length > i} />
              ))}
            </View>

            {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}

            <View style={styles.numPad}>
              {DIGITS.map((row, ri) => (
                <View key={ri} style={styles.numRow}>
                  {row.map((d, di) => (
                    <TouchableOpacity
                      key={di}
                      onPress={() => {
                        if (d === 'del') handlePinDelete();
                        else if (d) handlePinPress(d);
                      }}
                      style={[styles.numKey, !d && styles.numKeyEmpty]}
                      activeOpacity={d ? 0.6 : 1}>
                      {d === 'del' ? (
                        <Icon name="backspace-outline" size={24} color={colors.text} />
                      ) : d ? (
                        <Text style={styles.numKeyText}>{d}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </>
        )}
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Biometric login" onBack={() => navigation.goBack()}>

      {getAnyEnabled() && (
        <View style={styles.activeCard}>
          <View style={styles.activeCardTitleRow}>
            <Icon name="check-circle" size={16} color={colors.success} />
            <Text style={styles.activeCardText}>Biometric login is active</Text>
          </View>
          <Text style={styles.activeCardSub}>
            You can sign in using your enabled biometric method.
          </Text>
        </View>
      )}

      {BIOMETRIC_TYPES.map(bio => (
        <View key={bio.id} style={styles.bioCard}>
          <View style={styles.bioIconSmallWrap}>
            <Icon name={bio.icon} size={26} color={colors.primary} />
          </View>
          <View style={styles.bioInfo}>
            <Text style={styles.bioLabel}>{bio.label}</Text>
            <Text style={styles.bioSub}>{bio.sub}</Text>
          </View>
          <Switch
            value={enabled[bio.id]}
            onValueChange={v => handleToggle(bio.id, v)}
            trackColor={{false: colors.border, true: `${colors.primary}80`}}
            thumbColor={enabled[bio.id] ? colors.primary : '#f4f3f4'}
          />
        </View>
      ))}

      <View style={styles.infoBox}>
        <View style={styles.infoBoxTitleRow}>
          <Icon name="lock-outline" size={16} color={colors.text} />
          <Text style={styles.infoBoxTitle}>How it works</Text>
        </View>
        <Text style={styles.infoBoxText}>
          When enabled, biometric login replaces typing your password. A 6-digit
          backup PIN is required in case biometric is unavailable.
        </Text>
      </View>

      {getAnyEnabled() && (
        <TouchableOpacity
          onPress={async () => {
            const next = {fingerprint: false, faceid: false};
            setEnabled(next);
            await clearBiometricCredential();
            await persistEnabled(next);
          }}
          style={styles.disableAllBtn}>
          <Text style={styles.disableAllText}>Disable all biometrics</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  activeCard: {
    backgroundColor: `${colors.success}14`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  activeCardTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4},
  activeCardText: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.success},
  activeCardSub: {fontSize: fontSize.sm, color: colors.textSecondary},
  bioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  bioIconSmallWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioInfo: {flex: 1},
  bioLabel: {fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 2},
  bioSub: {fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18},
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoBoxTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs},
  infoBoxTitle: {fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text},
  infoBoxText: {fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20},
  disableAllBtn: {alignItems: 'center', marginTop: spacing.lg},
  disableAllText: {fontSize: fontSize.sm, color: colors.error, fontWeight: fontWeight.semiBold},
  bioIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  pinPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  pinPrompt: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  pinSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {backgroundColor: colors.primary},
  pinError: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.error,
    marginBottom: spacing.md,
  },
  numPad: {gap: spacing.sm, marginTop: spacing.md},
  numRow: {flexDirection: 'row', justifyContent: 'center', gap: spacing.sm},
  numKey: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyEmpty: {backgroundColor: 'transparent', borderColor: 'transparent'},
  numKeyText: {fontSize: fontSize.xl, fontWeight: fontWeight.semiBold, color: colors.text},
});

export default BiometricScreen;