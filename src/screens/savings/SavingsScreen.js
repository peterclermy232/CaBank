import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {savingsApi, otpApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);

const SavingsScreen = ({navigation}) => {
  const {accounts} = useData();

  const [view, setView] = useState('menu'); // menu | add | manage
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savings, setSavings] = useState([]);
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    if (view === 'manage') {
      setLoadingSavings(true);
      savingsApi
        .list()
        .then(data => setSavings(data ?? []))
        .catch(err => console.warn('Savings load error:', err.message))
        .finally(() => setLoadingSavings(false));
    }
  }, [view]);

  const handleBack = () => {
    if (view === 'menu') {
      navigation.goBack();
    } else if (view === 'add' && step === 2) {
      setStep(1);
    } else {
      setView('menu');
      setStep(1);
      setAmount('');
      setOtp('');
      setSelectedAccount(null);
    }
  };

  const handleGetOtp = async () => {
    setOtpLoading(true);
    try {
      await otpApi.request();
      Alert.alert('Code sent', 'Please enter the OTP you received.');
    } catch (err) {
      Alert.alert('Failed to send code', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCreateSavings = async () => {
    const account = selectedAccount ?? accounts[0];
    if (!account || !amount || !otp) return;
    setLoading(true);
    try {
      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const toISO = d => d.toISOString().split('T')[0];

      await savingsApi.create({
        accountNumber: account.accountNumber ?? account.number ?? '',
        amount: parseFloat(amount),
        period: '12 months',
        fromDate: toISO(today),
        toDate: toISO(nextYear),
        interestRate: 5.0,
        otpCode: otp,
      });
      setDone(true);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ScreenWrapper title="Save online" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Save online successfully!</Text>
          <Text style={styles.successDesc}>
            Congratulations! You have saved money online successfully!
          </Text>
          <Button label="Confirm" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Save online" onBack={handleBack}>
      {/* ── MENU ── */}
      {view === 'menu' && (
        <>
          {[
            {
              id: 'add',
              label: 'Add',
              sub: 'Add new save online account',
              icon: '➕',
            },
            {
              id: 'manage',
              label: 'Management',
              sub: 'Manage your save online account',
              icon: '📊',
            },
          ].map(it => (
            <TouchableOpacity
              key={it.id}
              onPress={() => setView(it.id)}
              style={styles.menuItem}
              activeOpacity={0.8}>
              <View style={styles.menuIcon}>
                <Text style={styles.menuEmoji}>{it.icon}</Text>
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>{it.label}</Text>
                <Text style={styles.menuSub}>{it.sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* ── MANAGE ── */}
      {view === 'manage' && (
        <>
          {loadingSavings ? (
            <ActivityIndicator
              color={colors.primary}
              style={{marginTop: spacing.xl}}
            />
          ) : savings.length === 0 ? (
            <Text style={styles.emptyText}>No savings accounts yet.</Text>
          ) : (
            savings.map(s => (
              <View key={s.id} style={styles.savingCard}>
                <View style={styles.savingRow}>
                  <Text style={styles.savingKey}>Account</Text>
                  <Text style={styles.savingAcct}>{s.accountNumber}</Text>
                </View>
                {[
                  ['From', s.fromDate],
                  ['To', s.toDate],
                  ['Time deposit', s.period],
                  ['Interest rate', `${s.interestRate}%`],
                  ['Amount', fmt(s.amount)],
                  ['Status', s.status],
                ].map(([k, v]) => (
                  <View key={k} style={styles.savingRow}>
                    <Text style={styles.savingKey}>{k}</Text>
                    <Text style={styles.savingVal}>{v}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </>
      )}

      {/* ── ADD STEP 1 ── */}
      {view === 'add' && step === 1 && (
        <>
          <Text style={styles.emoji}>🐷</Text>

          <Text style={styles.sectionLabel}>Choose account</Text>
          {accounts.length === 0 ? (
            <Text style={styles.emptyText}>No accounts found.</Text>
          ) : (
            accounts.map(a => (
              <TouchableOpacity
                key={a.id}
                onPress={() => setSelectedAccount(a)}
                style={[
                  styles.accountOption,
                  selectedAccount?.id === a.id && styles.accountOptionSelected,
                ]}>
                <Text style={styles.accountOptionNum}>
                  {a.accountNumber ?? a.number}
                </Text>
                <Text style={styles.accountOptionBal}>
                  Balance: {fmt(a.balance ?? 0)}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <Input
            label="Amount (At least $1,000)"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{marginTop: spacing.md}}
          />
          <Button
            label="Next"
            onPress={() => setStep(2)}
            disabled={!amount || parseFloat(amount) < 1000}
            style={styles.btn}
          />
        </>
      )}

      {/* ── ADD STEP 2 ── */}
      {view === 'add' && step === 2 && (
        <>
          <Text style={styles.emoji}>🐷</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              Account{' '}
              {(selectedAccount ?? accounts[0])?.accountNumber ?? '—'}
            </Text>
            <Text style={styles.summaryBal}>
              Available balance:{' '}
              {fmt((selectedAccount ?? accounts[0])?.balance ?? 0)}
            </Text>
            <Text style={styles.summaryRate}>
              Interest rate 5% / 12 months
            </Text>
            <Text style={styles.summaryAmount}>$ {amount}</Text>
          </View>

          <Text style={styles.sectionLabel}>Verification code</Text>
          <View style={styles.otpRow}>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              style={styles.otpInput}
              keyboardType="number-pad"
            />
            <Button
              label={otpLoading ? 'Sending…' : 'Get OTP'}
              variant="outline"
              onPress={handleGetOtp}
              disabled={otpLoading}
              style={styles.otpBtn}
            />
          </View>

          <Button
            label={loading ? 'Saving…' : 'Verify'}
            onPress={handleCreateSavings}
            disabled={!otp || !amount || loading}
            loading={loading}
          />
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  menuItem: {
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
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {fontSize: 26},
  menuTextWrap: {flex: 1},
  menuLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  menuSub: {fontSize: fontSize.sm, color: colors.textSecondary},
  chevron: {fontSize: 22, color: colors.textMuted},
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    fontStyle: 'italic',
  },
  savingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  savingKey: {fontSize: fontSize.sm, color: colors.textSecondary},
  savingAcct: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  savingVal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
  },
  emoji: {fontSize: 64, textAlign: 'center', marginBottom: spacing.lg},
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  accountOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  accountOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  accountOptionNum: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
  },
  accountOptionBal: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.semiBold,
  },
  btn: {marginTop: spacing.sm},
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  summaryBal: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.semiBold,
    marginBottom: 4,
  },
  summaryRate: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  summaryAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  otpInput: {flex: 1},
  otpBtn: {width: 'auto', paddingHorizontal: spacing.md},
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['2xl'],
  },
  successEmoji: {fontSize: 72, marginBottom: spacing.lg},
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  successDesc: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});

export default SavingsScreen;