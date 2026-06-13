import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {savingsApi, otpApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
    n,
  );

const fmtExact = n =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(n);

/**
 * Calculate interest earned so far using simple interest:
 *   interest = principal × rate × elapsed_years
 *
 * elapsed_years is computed from the real wall-clock time so the
 * value ticks up every second in the UI.
 */
const calcInterestEarned = (principal, annualRatePct, fromDateStr) => {
  const from = new Date(fromDateStr);
  const now = new Date();
  const elapsedMs = Math.max(0, now - from);
  const elapsedYears = elapsedMs / (365.25 * 24 * 60 * 60 * 1000);
  return principal * (annualRatePct / 100) * elapsedYears;
};

const calcProjectedReturn = (principal, annualRatePct, months) => {
  const years = months / 12;
  return principal * (annualRatePct / 100) * years;
};

const daysRemaining = toDateStr => {
  const to = new Date(toDateStr);
  const now = new Date();
  const diff = Math.ceil((to - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const progressPct = (fromDateStr, toDateStr) => {
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  const now = new Date();
  const total = to - from;
  const elapsed = now - from;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

const fmtDate = iso =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const statusColor = status => {
  switch (status) {
    case 'ACTIVE':
      return colors.success ?? '#16a34a';
    case 'MATURED':
      return colors.primary;
    case 'WITHDRAWN':
      return colors.textMuted ?? '#9ca3af';
    default:
      return colors.textSecondary;
  }
};

// ─── Live Interest Ticker ─────────────────────────────────────────────────────

/**
 * Renders a single savings card with a ticker that updates every second.
 */
const SavingCard = ({item}) => {
  const [interest, setInterest] = useState(() =>
    calcInterestEarned(
      parseFloat(item.amount),
      parseFloat(item.interestRate),
      item.fromDate,
    ),
  );

  const tickRef = useRef(null);

  useEffect(() => {
    if (item.status !== 'ACTIVE') return;

    tickRef.current = setInterval(() => {
      setInterest(
        calcInterestEarned(
          parseFloat(item.amount),
          parseFloat(item.interestRate),
          item.fromDate,
        ),
      );
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [item]);

  const principal = parseFloat(item.amount);
  const rate = parseFloat(item.interestRate);
  const months = parseInt(item.period ?? '12', 10);
  const projected = calcProjectedReturn(principal, rate, months);
  const pct = progressPct(item.fromDate, item.toDate);
  const days = daysRemaining(item.toDate);
  const currentValue = principal + interest;
  const isActive = item.status === 'ACTIVE';

  return (
    <View style={styles.savingCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardAcct}>{item.accountNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: `${statusColor(item.status)}18`},
            ]}>
            {isActive && <View style={styles.pulseDot} />}
            <Text
              style={[styles.statusText, {color: statusColor(item.status)}]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.rateLabel}>APR</Text>
          <Text style={styles.rateValue}>{rate}%</Text>
        </View>
      </View>

      {/* Live balance */}
      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>Current value</Text>
        <Text style={styles.balanceValue}>{fmt(currentValue)}</Text>
        {isActive && (
          <Text style={styles.interestTicker}>
            +{fmtExact(interest)} earned so far
          </Text>
        )}
      </View>

      {/* Progress bar */}
      {isActive && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${pct.toFixed(1)}%`}]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressDate}>{fmtDate(item.fromDate)}</Text>
            <Text style={styles.progressPct}>{pct.toFixed(1)}% complete</Text>
            <Text style={styles.progressDate}>{fmtDate(item.toDate)}</Text>
          </View>
          <Text style={styles.daysLeft}>
            {days} day{days !== 1 ? 's' : ''} until maturity
          </Text>
        </View>
      )}

      {/* Detail rows */}
      <View style={styles.detailGrid}>
        {[
          ['Principal', fmt(principal)],
          ['Term', item.period],
          ['Projected interest', fmt(projected)],
          ['Projected total', fmt(principal + projected)],
        ].map(([k, v]) => (
          <View key={k} style={styles.detailRow}>
            <Text style={styles.detailKey}>{k}</Text>
            <Text style={styles.detailVal}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // ── Summary ticker (total interest across all active plans) ──────────────
  const [totalInterest, setTotalInterest] = useState(0);
  const summaryTickRef = useRef(null);

  const recomputeSummary = useCallback(plans => {
    const active = plans.filter(s => s.status === 'ACTIVE');
    const total = active.reduce(
      (sum, s) =>
        sum +
        calcInterestEarned(
          parseFloat(s.amount),
          parseFloat(s.interestRate),
          s.fromDate,
        ),
      0,
    );
    setTotalInterest(total);
  }, []);

  useEffect(() => {
    if (view !== 'manage' || savings.length === 0) {
      clearInterval(summaryTickRef.current);
      return;
    }
    summaryTickRef.current = setInterval(
      () => recomputeSummary(savings),
      1000,
    );
    return () => clearInterval(summaryTickRef.current);
  }, [view, savings, recomputeSummary]);

  // ── Load savings ──────────────────────────────────────────────────────────
  const loadSavings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingSavings(true);
    try {
      const data = await savingsApi.list();
      const list = data ?? [];
      setSavings(list);
      recomputeSummary(list);
    } catch (err) {
      console.warn('Savings load error:', err.message);
    } finally {
      setLoadingSavings(false);
      setRefreshing(false);
    }
  }, [recomputeSummary]);

  useEffect(() => {
    if (view === 'manage') loadSavings();
  }, [view, loadSavings]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleBack = () => {
  if (view === 'menu') {
    navigation.goBack();          // ✅ menu → previous screen
  } else if (view === 'add' && step === 2) {
    setStep(1);                   // ✅ add step 2 → step 1
  } else {
    setView('menu');              // ✅ manage/add → menu
    setStep(1);
    setAmount('');
    setOtp('');
    setSelectedAccount(null);
  }
};

  // ── OTP ───────────────────────────────────────────────────────────────────
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

  // ── Create savings ────────────────────────────────────────────────────────
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

  // ── Summary numbers ───────────────────────────────────────────────────────
  const totalSaved = savings.reduce((s, p) => s + parseFloat(p.amount), 0);
  const activePlans = savings.filter(s => s.status === 'ACTIVE').length;

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <ScreenWrapper title="Save online" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Saved successfully!</Text>
          <Text style={styles.successDesc}>
            Your savings plan is now active and earning interest in real time.
          </Text>
          <Button
            label="View my savings"
            onPress={() => {
              setDone(false);
              setView('manage');
            }}
            style={{marginBottom: spacing.sm}}
          />
          <Button
            label="Back to home"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
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
            {id: 'add', label: 'Add', sub: 'Start a new savings plan', icon: '➕'},
            {id: 'manage', label: 'Management', sub: 'Track live interest & history', icon: '📊'},
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSavings(true)}
              tintColor={colors.primary}
            />
          }>
          {loadingSavings ? (
            <ActivityIndicator
              color={colors.primary}
              style={{marginTop: spacing.xl}}
            />
          ) : savings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🐷</Text>
              <Text style={styles.emptyTitle}>No savings yet</Text>
              <Text style={styles.emptyText}>
                Start your first savings plan to earn 5% interest.
              </Text>
              <Button
                label="Create savings plan"
                onPress={() => setView('add')}
                style={{marginTop: spacing.md}}
              />
            </View>
          ) : (
            <>
              {/* Summary strip */}
              <View style={styles.summaryStrip}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total saved</Text>
                  <Text style={styles.summaryValue}>{fmt(totalSaved)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Interest earned</Text>
                  <Text style={[styles.summaryValue, {color: colors.success ?? '#16a34a'}]}>
                    {fmt(totalInterest)}
                  </Text>
                  <Text style={styles.summaryLive}>● live</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Active plans</Text>
                  <Text style={styles.summaryValue}>{activePlans}</Text>
                </View>
              </View>

              {/* Per-plan cards */}
              {savings.map(s => (
                <SavingCard key={s.id} item={s} />
              ))}

              <Text style={styles.pullHint}>Pull down to refresh</Text>
            </>
          )}
        </ScrollView>
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
            label="Amount (minimum $1,000)"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{marginTop: spacing.md}}
          />
          {amount && parseFloat(amount) >= 1000 && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Savings preview</Text>
              {[
                ['Annual interest (5%)', fmt(parseFloat(amount) * 0.05)],
                ['Value at maturity', fmt(parseFloat(amount) * 1.05)],
                ['Term', '12 months'],
              ].map(([k, v]) => (
                <View key={k} style={styles.detailRow}>
                  <Text style={styles.detailKey}>{k}</Text>
                  <Text style={styles.detailVal}>{v}</Text>
                </View>
              ))}
            </View>
          )}
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
              Account {(selectedAccount ?? accounts[0])?.accountNumber ?? '—'}
            </Text>
            <Text style={styles.summaryBal}>
              Available balance:{' '}
              {fmt((selectedAccount ?? accounts[0])?.balance ?? 0)}
            </Text>
            <Text style={styles.summaryRate}>Interest rate 5% / 12 months</Text>
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
            label={loading ? 'Saving…' : 'Confirm & save'}
            onPress={handleCreateSavings}
            disabled={!otp || !amount || loading}
            loading={loading}
          />
        </>
      )}
    </ScreenWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Menu
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

  // Summary strip
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  summaryItem: {flex: 1, alignItems: 'center'},
  summaryDivider: {width: 1, height: 36, backgroundColor: colors.border},
  summaryLabel: {fontSize: 11, color: colors.textSecondary, marginBottom: 2},
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  summaryLive: {fontSize: 10, color: colors.success ?? '#16a34a', marginTop: 1},

  // Saving card
  savingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {gap: 4},
  cardAcct: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4,
    alignSelf: 'flex-start',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success ?? '#16a34a',
  },
  statusText: {fontSize: 11, fontWeight: fontWeight.semiBold},
  cardHeaderRight: {alignItems: 'flex-end'},
  rateLabel: {fontSize: 10, color: colors.textSecondary},
  rateValue: {
    fontSize: fontSize.lg ?? 18,
    fontWeight: fontWeight.extraBold ?? '800',
    color: colors.primary,
  },

  // Live balance
  balanceBlock: {marginBottom: spacing.md},
  balanceLabel: {fontSize: fontSize.sm, color: colors.textSecondary},
  balanceValue: {
    fontSize: 26,
    fontWeight: fontWeight.extraBold ?? '800',
    color: colors.text,
    marginTop: 2,
  },
  interestTicker: {
    fontSize: fontSize.sm,
    color: colors.success ?? '#16a34a',
    fontWeight: fontWeight.semiBold,
    marginTop: 2,
  },

  // Progress
  progressSection: {marginBottom: spacing.md},
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  progressDate: {fontSize: 10, color: colors.textMuted},
  progressPct: {fontSize: 10, color: colors.primary, fontWeight: fontWeight.semiBold},
  daysLeft: {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2},

  // Detail grid
  detailGrid: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailKey: {fontSize: fontSize.sm, color: colors.textSecondary},
  detailVal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
  },

  // Empty state
  emptyState: {alignItems: 'center', paddingTop: spacing.xl},
  emptyEmoji: {fontSize: 56, marginBottom: spacing.sm},
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pullHint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    paddingBottom: spacing.xl,
  },

  // Add flow
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
    color: colors.success ?? '#16a34a',
    fontWeight: fontWeight.semiBold,
  },
  previewCard: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  previewTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
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
    color: colors.success ?? '#16a34a',
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
    fontWeight: fontWeight.extraBold ?? '800',
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

  // Success
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['2xl'],
  },
  successEmoji: {fontSize: 72, marginBottom: spacing.lg},
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold ?? '800',
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