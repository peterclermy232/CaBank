import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import {Button, ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const BIOMETRIC_TYPES = [
  {
    id: 'fingerprint',
    icon: '👆',
    label: 'Fingerprint',
    sub: 'Use your fingerprint to sign in quickly and securely.',
  },
  {
    id: 'faceid',
    icon: '🤳',
    label: 'Face ID',
    sub: 'Use facial recognition to verify your identity.',
  },
];

const PinDot = ({filled}) => (
  <View
    style={[
      styles.pinDot,
      filled && styles.pinDotFilled,
    ]}
  />
);

const BiometricScreen = ({navigation}) => {
  const [enabled, setEnabled] = useState({fingerprint: false, faceid: false});
  const [activating, setActivating] = useState(null);
  const [pin, setPin] = useState('');
  const [pinStep, setPinStep] = useState('enter'); // enter | confirm
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  const handleToggle = (id, value) => {
    if (value) {
      setActivating(id);
      setPin('');
      setPinStep('enter');
      setFirstPin('');
      setPinError('');
      setPinSuccess(false);
    } else {
      setEnabled(prev => ({...prev, [id]: false}));
    }
  };

  const handlePinPress = digit => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setPinError('');

    if (next.length === 6) {
      setTimeout(() => {
        if (pinStep === 'enter') {
          setFirstPin(next);
          setPin('');
          setPinStep('confirm');
        } else {
          if (next === firstPin) {
            setEnabled(prev => ({...prev, [activating]: true}));
            setPinSuccess(true);
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
    ['', '0', '⌫'],
  ];

  const getAnyEnabled = () => Object.values(enabled).some(Boolean);

  if (activating) {
    const bio = BIOMETRIC_TYPES.find(b => b.id === activating);
    return (
      <ScreenWrapper
        title={`Enable ${bio.label}`}
        onBack={() => setActivating(null)}>

        <Animated.View style={[styles.bioIconWrap, {transform: [{scale: pulseAnim}]}]}>
          <Text style={styles.bioIconLarge}>{bio.icon}</Text>
        </Animated.View>

        <Text style={styles.pinPrompt}>
          {pinSuccess
            ? '✅  Biometric enabled!'
            : pinStep === 'enter'
            ? 'Create a 6-digit backup PIN'
            : 'Confirm your PIN'}
        </Text>
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
                        if (d === '⌫') handlePinDelete();
                        else if (d) handlePinPress(d);
                      }}
                      style={[styles.numKey, !d && styles.numKeyEmpty]}
                      activeOpacity={d ? 0.6 : 1}>
                      {d ? <Text style={styles.numKeyText}>{d}</Text> : null}
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
          <Text style={styles.activeCardText}>
            ✅  Biometric login is active
          </Text>
          <Text style={styles.activeCardSub}>
            You can sign in using your enabled biometric method.
          </Text>
        </View>
      )}

      {BIOMETRIC_TYPES.map(bio => (
        <View key={bio.id} style={styles.bioCard}>
          <View style={styles.bioIconSmallWrap}>
            <Text style={styles.bioIconSmall}>{bio.icon}</Text>
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
        <Text style={styles.infoBoxTitle}>🔒  How it works</Text>
        <Text style={styles.infoBoxText}>
          When enabled, biometric login replaces typing your password. A 6-digit backup PIN is required in case biometric is unavailable.
        </Text>
      </View>

      {getAnyEnabled() && (
        <TouchableOpacity
          onPress={() => {
            setEnabled({fingerprint: false, faceid: false});
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
  activeCardText: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.success, marginBottom: 4},
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
  bioIconSmall: {fontSize: 26},
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
  infoBoxTitle: {fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs},
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
  bioIconLarge: {fontSize: 52},
  pinPrompt: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
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