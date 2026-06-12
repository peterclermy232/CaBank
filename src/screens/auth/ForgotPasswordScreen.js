import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {authApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight} from '../../theme';

const ForgotPasswordScreen = ({navigation}) => {
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=newPass, 4=success
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await authApi.forgotPassword(phone);
      setStep(2);
    } catch (err) {
      Alert.alert('Failed to send code', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword(phone);
      Alert.alert('Code resent', 'Check your messages for the new code.');
    } catch (err) {
      Alert.alert('Failed to resend code', err.message);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await authApi.verifyOtp(phone, code);
      setStep(3);
    } catch (err) {
      Alert.alert('Invalid code', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await authApi.resetPassword(phone, newPass, confirmPass);
      setStep(4);
    } catch (err) {
      Alert.alert('Failed to reset password', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <ScreenWrapper title="Forgot password" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Change password successfully!</Text>
          <Text style={styles.successDesc}>
            You have successfully changed your password. Please use the new password when signing in.
          </Text>
          <Button label="Ok" onPress={() => navigation.replace('SignIn')} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title="Forgot password"
      onBack={() => (step > 1 ? setStep(s => s - 1) : navigation.goBack())}>
      {step === 1 && (
        <View>
          <Text style={styles.label}>Type your phone number</Text>
          <Input placeholder="(+84) 039 882 9xxx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={styles.hint}>We'll send you a code to verify your phone number</Text>
          <Button label={loading ? 'Sending…' : 'Send'} onPress={handleSendCode} disabled={!phone || loading} loading={loading} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Type a code</Text>
          <View style={styles.codeRow}>
            <Input placeholder="Code" value={code} onChangeText={setCode} style={styles.codeInput} keyboardType="number-pad" />
            <Button label="Resend" variant="outline" onPress={handleResend} style={styles.resendBtn} />
          </View>
          <Text style={styles.hint}>
            We sent a code to your phone via your CaBank messages. This code will expire in 10 minutes.
          </Text>
          <Button label={loading ? 'Verifying…' : 'Change password'} onPress={handleVerifyCode} disabled={!code || loading} loading={loading} />
        </View>
      )}

      {step === 3 && (
        <View>
          <Input label="New password" placeholder="Enter new password" value={newPass} onChangeText={setNewPass} secureTextEntry />
          <Input label="Confirm password" placeholder="Confirm new password" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry />
          <Button
            label={loading ? 'Saving…' : 'Change password'}
            onPress={handleResetPassword}
            disabled={!newPass || !confirmPass || newPass !== confirmPass || loading}
            loading={loading}
            style={styles.btn}
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  label: {fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm},
  hint: {fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20},
  codeRow: {flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start'},
  codeInput: {flex: 1},
  resendBtn: {width: 'auto', paddingHorizontal: spacing.md},
  btn: {marginTop: spacing.sm},
  successContainer: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['2xl']},
  successEmoji: {fontSize: 72, marginBottom: spacing.lg},
  successTitle: {fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.primary, marginBottom: spacing.sm, textAlign: 'center'},
  successDesc: {fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22},
});

export default ForgotPasswordScreen;