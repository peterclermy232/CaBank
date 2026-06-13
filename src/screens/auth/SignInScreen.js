import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button, Input} from '../../components/common';
import {useAuth} from '../../context/AuthContext';
import {authApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';
import {
  getBiometricCredential,
  getAvailableBiometryType,
} from '../../utils/biometrics';

const BIOMETRIC_ENABLED_KEY = 'cabank_biometric_enabled';

const SignInScreen = ({navigation}) => {
  const {signIn, signInWithTokens} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState(null);

  useEffect(() => {
  (async () => {
    try {
      const stored = await AsyncStorage.getItem('cabank_biometric_enabled');
      const anyEnabled = stored
        ? Object.values(JSON.parse(stored)).some(Boolean)
        : false;

      if (!anyEnabled) return;

      const type = await getAvailableBiometryType();

      // Show button if user enabled biometrics, even if type check returns null
      // The OS prompt will handle unavailability gracefully
      setBiometryType(type ?? 'Biometrics');
      setBiometricAvailable(true);
    } catch (e) {
      console.log('Biometric check error:', e);
    }
  })();
}, []);
  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert('Sign in failed', err.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSignIn = async () => {
    try {
      // This call triggers the native fingerprint / Face ID prompt
      const refreshToken = await getBiometricCredential();
      if (!refreshToken) {
        Alert.alert(
          'Biometric sign-in',
          'No saved credential found. Please sign in with your password first.',
        );
        return;
      }

      const result = await authApi.refreshToken(refreshToken);
      await signInWithTokens(result);
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert(
        'Biometric sign-in failed',
        err.message || 'Please try again or use your password.',
      );
    }
  };

  const biometricIcon =
    biometryType === 'FaceID' ? 'face-recognition' : 'fingerprint';
  const biometricLabel =
    biometryType === 'FaceID' ? 'Face ID' : 'Fingerprint';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.welcome}>Welcome Back</Text>
        <Text style={styles.subtitle}>Hello there, sign in to continue</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>

        <Input
          placeholder="Email or Username"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotWrap}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>

        <Button
          label={loading ? 'Signing in…' : 'Sign In'}
          onPress={handleSignIn}
          disabled={loading || !email || !password}
        />

        {biometricAvailable && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              onPress={handleBiometricSignIn}
              style={styles.biometricBtn}
              activeOpacity={0.7}>
              <Icon name={biometricIcon} size={32} color={colors.primary} />
              <Text style={styles.biometricLabel}>
                Sign in with {biometricLabel}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primary},
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
  },
  emoji: {fontSize: 52, marginBottom: spacing.sm},
  welcome: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extraBold,
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)'},
  body: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bodyContent: {padding: spacing.lg, paddingBottom: spacing['2xl']},
  forgotWrap: {alignItems: 'flex-end', marginBottom: spacing.lg},
  forgot: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semiBold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {flex: 1, height: 1, backgroundColor: colors.border},
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  biometricLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semiBold,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  signupText: {fontSize: fontSize.sm, color: colors.textSecondary},
  signupLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});

export default SignInScreen;