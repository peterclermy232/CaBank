import React, {useState} from 'react';
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
import {Button, Input} from '../../components/common';
import {useAuth} from '../../context/AuthContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const SignUpScreen = ({navigation}) => {
  const {signUp} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const isValid = name && email && phone && password && agree;

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password, phone);
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert('Sign up failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep(1) : navigation.goBack())}
          style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign up</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.welcome}>Welcome to us,</Text>
        <Text style={styles.subtitle}>Hello there, create New account</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        <Input placeholder="Name" value={name} onChangeText={setName} />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => setAgree(v => !v)}
          style={styles.checkRow}>
          <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
            {agree && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>
            By creating an account you agree to our{' '}
            <Text style={styles.link}>Term and Conditions</Text>
          </Text>
        </TouchableOpacity>

        <Button
          label={loading ? 'Creating account…' : step === 1 ? 'Next' : 'Sign up'}
          onPress={handleNext}
          disabled={!isValid || loading}
          style={styles.btn}
        />

        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primary},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backIcon: {fontSize: 22, color: '#fff', lineHeight: 24},
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  heroSection: {alignItems: 'center', paddingVertical: spacing.lg},
  emoji: {fontSize: 44, marginBottom: spacing.sm},
  welcome: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extraBold,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)'},
  body: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bodyContent: {padding: spacing.lg, paddingBottom: spacing['2xl']},
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {backgroundColor: colors.primary, borderColor: colors.primary},
  checkmark: {color: '#fff', fontSize: 12, fontWeight: fontWeight.bold},
  checkText: {flex: 1, fontSize: fontSize.sm, color: colors.textSecondary},
  link: {color: colors.primary, fontWeight: fontWeight.semiBold},
  btn: {marginBottom: spacing.md},
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  signInText: {fontSize: fontSize.sm, color: colors.textSecondary},
  signInLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});

export default SignUpScreen;