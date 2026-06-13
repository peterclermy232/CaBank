import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import {ScreenWrapper, Button, Input} from '../../components/common';
import {useData} from '../../context/DataContext';
import {otpApi, depositsApi} from '../../api/services';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n ?? 0);

const DepositScreen = ({navigation}) => {
  const {accounts, setAccounts} = useData();

  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [newBalance, setNewBalance] = useState(null);

  const otpRef = useRef(null);

  // Ensure we always have a valid account once `accounts` is loaded,
  // even if it arrives asynchronously after first render.
  useEffect(() => {
    if (!selectedAccount && accounts && accounts.length > 0) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount]);

  const account = selectedAccount ?? accounts?.[0] ?? null;

  // Strip whitespace and any stray currency symbols before parsing
  const cleanedAmount = String(amount ?? '').trim().replace(/[^0-9.]/g, '');
  const parsedAmount = parseFloat(cleanedAmount);

  const isStep1Valid =
    !!account &&
    cleanedAmount.length > 0 &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0;

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
      return;
    }

    navigation.goBack();
  };

  const handleAmountChange = text => {
    // Defensive: some custom Input components pass an event object
    // instead of a string through onChangeText.
    const value =
      typeof text === 'string'
        ? text
        : text?.nativeEvent?.text ?? text?.target?.value ?? '';

    setAmount(value);
  };

  const handleGetOtp = async () => {
    try {
      setOtpLoading(true);

      await otpApi.request();

      Alert.alert(
        'OTP Sent',
        'A verification code has been sent to your registered phone.',
      );

      setTimeout(() => {
        otpRef.current?.focus?.();
      }, 300);
    } catch (error) {
      Alert.alert(
        'OTP Error',
        error?.message || 'Failed to send OTP',
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!otp || !account || !parsedAmount) {
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await depositsApi.create({
        accountNumber:
          account.accountNumber ?? account.number,
        amount: parsedAmount,
        note: note.trim() || undefined,
        otpCode: otp,
      });

      setNewBalance(response.newBalance);

      setAccounts(prev =>
        prev.map(acc =>
          (acc.accountNumber ?? acc.number) ===
          (account.accountNumber ?? account.number)
            ? {
                ...acc,
                balance: response.newBalance,
              }
            : acc,
        ),
      );

      setDone(true);
    } catch (error) {
      Alert.alert(
        'Deposit Failed',
        error?.message || 'Unable to process deposit',
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ScreenWrapper
        title="Deposit"
        onBack={() => navigation.goBack()}>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>🎉</Text>

          <Text style={styles.successTitle}>
            Deposit Successful
          </Text>

          <Text style={styles.successDesc}>
            {fmt(parsedAmount)} deposited into account
            {'\n'}
            {account?.accountNumber ??
              account?.number}
          </Text>

          {newBalance != null && (
            <View style={styles.balanceChip}>
              <Text style={styles.balanceLabel}>
                New Balance
              </Text>

              <Text style={styles.balanceValue}>
                {fmt(newBalance)}
              </Text>
            </View>
          )}

          <Button
            label="Done"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title="Deposit"
      onBack={handleBack}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">

          <Text style={styles.heroEmoji}>💰</Text>

          {step === 1 && (
            <>
              <Text style={styles.sectionLabel}>
                Select Account
              </Text>

              {(accounts ?? []).map(acc => (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() =>
                    setSelectedAccount(acc)
                  }
                  style={[
                    styles.accountOption,
                    (account?.id) === acc.id &&
                      styles.accountOptionSelected,
                  ]}>
                  <Text style={styles.accountNum}>
                    {acc.accountNumber ??
                      acc.number}
                  </Text>

                  <Text style={styles.accountBal}>
                    Balance:{' '}
                    {fmt(acc.balance || 0)}
                  </Text>
                </TouchableOpacity>
              ))}

              <Input
                label="Amount"
                placeholder="Enter amount"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="Note (Optional)"
                placeholder="Deposit note"
                value={note}
                onChangeText={setNote}
                style={styles.input}
              />

              <Button
                label="Next"
                onPress={() => setStep(2)}
                disabled={!isStep1Valid}
              />
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>
                  Account
                </Text>

                <Text style={styles.summaryAcct}>
                  {account?.accountNumber ??
                    account?.number}
                </Text>

                <Text style={styles.summaryBal}>
                  Current Balance:{' '}
                  {fmt(account?.balance || 0)}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.summaryAmount}>
                  {fmt(parsedAmount)}
                </Text>

                {note ? (
                  <Text style={styles.summaryNote}>
                    "{note}"
                  </Text>
                ) : null}
              </View>

              <Text style={styles.sectionLabel}>
                OTP Verification
              </Text>

              <View style={styles.otpRow}>
                <Input
                  ref={otpRef}
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  style={styles.otpInput}
                />

                <Button
                  label={
                    otpLoading
                      ? 'Sending...'
                      : 'Get OTP'
                  }
                  variant="outline"
                  onPress={handleGetOtp}
                  disabled={otpLoading}
                  style={styles.otpBtn}
                />
              </View>

              <Button
                label={
                  loading
                    ? 'Processing...'
                    : 'Confirm Deposit'
                }
                onPress={handleDeposit}
                disabled={!otp || loading}
                loading={loading}
              />
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
  },
  heroEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  accountOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  accountOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  accountNum: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  accountBal: {
    color: colors.success,
    marginTop: 4,
  },
  input: {
    marginBottom: spacing.sm,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    color: colors.textSecondary,
  },
  summaryAcct: {
    fontWeight: fontWeight.bold,
    marginTop: 4,
  },
  summaryBal: {
    color: colors.success,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
  },
  summaryNote: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  otpInput: {
    flex: 1,
  },
  otpBtn: {
    width: 120,
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  successEmoji: {
    fontSize: 72,
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    marginTop: spacing.md,
  },
  successDesc: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  balanceChip: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.success,
  },
  balanceValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extraBold,
    color: colors.success,
  },
});

export default DepositScreen;