import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight} from '../../theme';

const ForgotPasswordScreen = ({navigation}) => {
  const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=newPass, 4=success
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

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
          <Text style={styles.hint}>We texted you a code to verify your phone number</Text>
          <Button label="Send" onPress={() => setStep(2)} disabled={!phone} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Type a code</Text>
          <View style={styles.codeRow}>
            <Input placeholder="Code" value={code} onChangeText={setCode} style={styles.codeInput} keyboardType="number-pad" />
            <Button label="Resend" variant="outline" onPress={() => {}} style={styles.resendBtn} />
          </View>
          <Text style={styles.hint}>
            We texted you a code to verify your phone number (+84) 039 882 9xxx. This code will expire in 10 minutes.
          </Text>
          <Button label="Change password" onPress={() => setStep(3)} disabled={!code} />
        </View>
      )}

      {step === 3 && (
        <View>
          <Input label="New password" placeholder="Enter new password" value={newPass} onChangeText={setNewPass} secureTextEntry />
          <Input label="Confirm password" placeholder="Confirm new password" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry />
          <Button
            label="Change password"
            onPress={() => setStep(4)}
            disabled={!newPass || !confirmPass || newPass !== confirmPass}
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
