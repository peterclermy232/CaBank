import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Button, Input} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const SignInScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.welcome}>Welcome Back</Text>
        <Text style={styles.subtitle}>Hello there, sign in to continue</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Input
          placeholder="Email or Username"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotWrap}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>

        <Button label="Sign In" onPress={handleSignIn} />

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Text style={styles.biometric}>👆</Text>

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
  welcome: {fontSize: fontSize['3xl'], fontWeight: fontWeight.extraBold, color: '#fff', marginBottom: 6},
  subtitle: {fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)'},
  body: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bodyContent: {padding: spacing.lg, paddingBottom: spacing['2xl']},
  forgotWrap: {alignItems: 'flex-end', marginBottom: spacing.lg},
  forgot: {fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semiBold},
  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg},
  divider: {flex: 1, height: 1, backgroundColor: colors.border},
  dividerText: {marginHorizontal: spacing.md, fontSize: fontSize.sm, color: colors.textMuted},
  biometric: {fontSize: 52, textAlign: 'center', marginBottom: spacing.md},
  signupRow: {flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md},
  signupText: {fontSize: fontSize.sm, color: colors.textSecondary},
  signupLink: {fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold},
});

export default SignInScreen;
