import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const RULES = [
  {id: 'len', label: 'At least 8 characters', test: v => v.length >= 8},
  {id: 'upper', label: 'One uppercase letter', test: v => /[A-Z]/.test(v)},
  {id: 'num', label: 'One number', test: v => /\d/.test(v)},
  {id: 'special', label: 'One special character', test: v => /[^A-Za-z0-9]/.test(v)},
];

const RuleRow = ({label, passed}) => (
  <View style={styles.ruleRow}>
    <View style={[styles.ruleDot, passed && styles.ruleDotPassed]}>
      <Text style={styles.ruleDotText}>{passed ? '✓' : '·'}</Text>
    </View>
    <Text style={[styles.ruleLabel, passed && styles.ruleLabelPassed]}>{label}</Text>
  </View>
);

const StrengthBar = ({password}) => {
  const score = RULES.filter(r => r.test(password)).length;
  const colors_ = ['#E5E7EB', '#EB5757', '#F2994A', '#E6A817', '#27AE60'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[styles.strengthSegment, {backgroundColor: score >= i ? colors_[score] : colors_[0]}]}
          />
        ))}
      </View>
      {score > 0 && <Text style={[styles.strengthLabel, {color: colors_[score]}]}>{labels[score]}</Text>}
    </View>
  );
};

const ChangePasswordScreen = ({navigation}) => {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [currentError, setCurrentError] = useState('');

  const allRulesPassed = RULES.every(r => r.test(newPass));
  const matchError = confirm.length > 0 && newPass !== confirm;
  const canSubmit = current.length >= 4 && allRulesPassed && newPass === confirm && !matchError;

  const handleSubmit = () => {
    if (current !== '1234') {
      setCurrentError('Incorrect current password');
      return;
    }
    setCurrentError('');
    setDone(true);
  };

  if (done) {
    return (
      <ScreenWrapper title="Change password" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successIcon}>🔐</Text>
          </View>
          <Text style={styles.successTitle}>Password changed!</Text>
          <Text style={styles.successDesc}>
            Your password has been updated successfully. Use your new password next time you sign in.
          </Text>
          <Button label="Back to settings" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Change password" onBack={() => navigation.goBack()}>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          For your security, choose a strong password you haven't used before.
        </Text>
      </View>

      <Input
        label="Current password"
        placeholder="Enter current password"
        value={current}
        onChangeText={v => {setCurrent(v); setCurrentError('');}}
        secureTextEntry
        error={currentError}
      />

      <Input
        label="New password"
        placeholder="Enter new password"
        value={newPass}
        onChangeText={setNewPass}
        secureTextEntry
      />

      {newPass.length > 0 && (
        <View style={styles.rulesCard}>
          <StrengthBar password={newPass} />
          {RULES.map(r => (
            <RuleRow key={r.id} label={r.label} passed={r.test(newPass)} />
          ))}
        </View>
      )}

      <Input
        label="Confirm new password"
        placeholder="Re-enter new password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        error={matchError ? "Passwords don't match" : ''}
      />

      <Button
        label="Update password"
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={styles.btn}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot current password?</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: `${colors.primary}12`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoText: {fontSize: fontSize.sm, color: colors.primary, lineHeight: 20},
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  strengthBars: {flexDirection: 'row', gap: 4, flex: 1},
  strengthSegment: {flex: 1, height: 4, borderRadius: 2},
  strengthLabel: {fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, minWidth: 40},
  ruleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: spacing.sm},
  ruleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleDotPassed: {backgroundColor: colors.success},
  ruleDotText: {fontSize: 10, color: colors.textMuted},
  ruleLabel: {fontSize: fontSize.sm, color: colors.textMuted},
  ruleLabelPassed: {color: colors.success},
  btn: {marginTop: spacing.sm},
  forgotBtn: {alignItems: 'center', marginTop: spacing.md},
  forgotText: {fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semiBold},
  successContainer: {flex: 1, alignItems: 'center', paddingTop: spacing['2xl']},
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.success}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {fontSize: 40},
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successDesc: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});

export default ChangePasswordScreen;