import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {BankCard} from '../../components/cards';
import {billsApi, otpApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {useAuth} from '../../context/AuthContext';
import {normaliseCard} from '../../utils/normalise';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

// ─── Bill catalogue ───────────────────────────────────────────────────────────
// Each bill type has its own base amounts the user can pick from,
// plus a freeform "other" option. The backend applies 10% tax on top.

const BILL_TYPES = [
  {
    id: 'electric',
    label: 'Electricity',
    icon: 'lightning-bolt',
    color: '#F59E0B',
    bg: '#FEF3C7',
    presets: [150, 250, 350, 500, 750],
    hint: 'Enter your meter number as the bill code',
  },
  {
    id: 'water',
    label: 'Water',
    icon: 'water',
    color: '#3B82F6',
    bg: '#DBEAFE',
    presets: [80, 120, 180, 250, 400],
    hint: 'Enter your water account number',
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: 'wifi',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    presets: [30, 50, 80, 100, 150],
    hint: 'Enter your subscriber / account number',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: 'cellphone',
    color: '#10B981',
    bg: '#D1FAE5',
    presets: [10, 20, 50, 100, 200],
    hint: 'Enter the phone number to pay for',
  },
  {
    id: 'tv',
    label: 'TV / Cable',
    icon: 'television-play',
    color: '#EC4899',
    bg: '#FCE7F3',
    presets: [20, 35, 50, 75, 120],
    hint: 'Enter your decoder / subscriber ID',
  },
  {
    id: 'gas',
    label: 'Gas',
    icon: 'fire',
    color: '#EF4444',
    bg: '#FEE2E2',
    presets: [60, 100, 150, 200, 300],
    hint: 'Enter your gas account number',
  },
];

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n ?? 0);

// Simulate a bill lookup by code (in a real app this would be an API call)
const MOCK_CUSTOMERS = {
  '1234': {name: 'Peter Clermy', address: '14 Westlands Road, Nairobi'},
  '5678': {name: 'Jane Mwangi',  address: '77 Ngong Road, Nairobi'},
  '9012': {name: 'David Ochieng', address: '3 Mombasa Road, Nairobi'},
  '0000': {name: 'Test Account',  address: '1 CaBank Plaza, Nairobi'},
};

function lookupCustomer(billCode) {
  // Use last 4 digits as lookup key, fallback to a generic record
  const key = billCode.slice(-4);
  return MOCK_CUSTOMERS[key] ?? {
    name: 'Account ' + billCode,
    address: billCode.length >= 6 ? 'On file' : null,
  };
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepDot = ({n, active, done}) => (
  <View style={[styles.stepDot,
    active && styles.stepDotActive,
    done   && styles.stepDotDone]}>
    {done
      ? <Icon name="check" size={10} color="#fff" />
      : <Text style={styles.stepDotText}>{n}</Text>}
  </View>
);

const Steps = ({current}) => (
  <View style={styles.stepsRow}>
    {['Bill', 'Code', 'Confirm'].map((label, i) => {
      const n = i + 1;
      return (
        <React.Fragment key={label}>
          <View style={styles.stepItem}>
            <StepDot n={n} active={current === n} done={current > n} />
            <Text style={[styles.stepLabel, current === n && styles.stepLabelActive]}>
              {label}
            </Text>
          </View>
          {i < 2 && (
            <View style={[styles.stepLine, current > n && styles.stepLineDone]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
const BillsScreen = ({navigation}) => {
  const {cards: rawCards, setCards} = useData();
  const {user} = useAuth();

  const cards = rawCards.filter(c => c.active !== false);

  // ── State ──────────────────────────────────────────────────────────────
  const [step, setStep]                   = useState(1);
  const [selectedBill, setSelectedBill]   = useState(null);

  // Step 2 — code + amount
  const [billCode, setBillCode]           = useState('');
  const [customer, setCustomer]           = useState(null); // {name, address}
  const [lookingUp, setLookingUp]         = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null); // number | 'custom'
  const [customAmount, setCustomAmount]   = useState('');

  // Step 3 — card + OTP
  const [selectedCard, setSelectedCard]   = useState(cards[0] ?? null);
  const [otp, setOtp]                     = useState('');
  const [otpLoading, setOtpLoading]       = useState(false);
  const [paying, setPaying]               = useState(false);

  // Success state
  const [done, setDone]                   = useState(false);
  const [receipt, setReceipt]             = useState(null);

  // ── Derived ────────────────────────────────────────────────────────────
  const resolvedAmount =
    selectedAmount === 'custom'
      ? parseFloat(customAmount || '0')
      : selectedAmount ?? 0;

  const tax        = Math.round(resolvedAmount * 0.10 * 100) / 100;
  const total      = resolvedAmount + tax;
  const step2Valid = billCode.trim().length >= 4 && !!customer && resolvedAmount > 0;
  const step3Valid = !!selectedCard && otp.length >= 4;

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleSelectBill = bill => {
    setSelectedBill(bill);
    // reset downstream state
    setBillCode('');
    setCustomer(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setOtp('');
    setStep(2);
  };

  const handleLookup = useCallback(() => {
    if (billCode.trim().length < 4) {
      Alert.alert('Invalid code', 'Bill code must be at least 4 characters.');
      return;
    }
    setLookingUp(true);
    // Simulate network delay
    setTimeout(() => {
      const found = lookupCustomer(billCode.trim());
      if (!found.address) {
        Alert.alert('Not found', 'No account found for this bill code. Please check and try again.');
        setLookingUp(false);
        return;
      }
      setCustomer(found);
      setLookingUp(false);
    }, 800);
  }, [billCode]);

  const handleGetOtp = async () => {
    setOtpLoading(true);
    try {
      const result = await otpApi.request();
      if (result?.code) setOtp(result.code);
      Alert.alert('OTP Sent', 'A verification code has been sent to your in-app messages.');
    } catch (err) {
      Alert.alert('Failed to send OTP', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedCard || !resolvedAmount || !otp || !selectedBill || !customer) return;
    setPaying(true);
    try {
      const result = await billsApi.pay({
        billType:        selectedBill.id,
        billCode:        billCode.trim(),
        customerName:    customer.name,
        customerAddress: customer.address,
        amount:          resolvedAmount,
        cardId:          selectedCard.id,
        otpCode:         otp,
      });

      // Update card balance in context
      if (result?.newCardBalance != null) {
        setCards(prev =>
          prev.map(c =>
            c.id === selectedCard.id
              ? {...c, balance: result.newCardBalance}
              : c,
          ),
        );
      }

      setReceipt(result);
      setDone(true);
    } catch (err) {
      Alert.alert('Payment failed', err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleBack = () => {
    if (step === 1) { navigation.goBack(); return; }
    if (step === 2) { setStep(1); setSelectedBill(null); return; }
    if (step === 3) { setStep(2); return; }
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (done) {
    const paidAmount  = receipt?.amount  ?? resolvedAmount;
    const paidTax     = receipt?.tax     ?? tax;
    const paidTotal   = (parseFloat(paidAmount) + parseFloat(paidTax)).toFixed(2);
    const newBal      = receipt?.newCardBalance;

    return (
      <ScreenWrapper title="Bill Payment" onBack={() => navigation.goBack()}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>
            Your {selectedBill?.label} bill has been paid
          </Text>

          <View style={styles.receiptCard}>
            {[
              ['Bill type',     selectedBill?.label],
              ['Bill code',     billCode],
              ['Customer',      customer?.name],
              ['Amount',        fmt(paidAmount)],
              ['Tax (10%)',     fmt(paidTax)],
              ['Total charged', fmt(paidTotal)],
              ['Card',          `•••• ${selectedCard?.last4}`],
            ].map(([k, v]) => (
              <View key={k} style={styles.receiptRow}>
                <Text style={styles.receiptKey}>{k}</Text>
                <Text style={[
                  styles.receiptVal,
                  k === 'Total charged' && styles.receiptValHighlight,
                ]}>
                  {v}
                </Text>
              </View>
            ))}

            {newBal != null && (
              <View style={[styles.receiptRow, styles.receiptBalRow]}>
                <Text style={styles.receiptKey}>New card balance</Text>
                <Text style={styles.receiptBal}>{fmt(newBal)}</Text>
              </View>
            )}
          </View>

          <Button
            label="Done"
            onPress={() => navigation.goBack()}
            style={{marginTop: spacing.lg}}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // ── Step 1: choose bill type ───────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <View style={styles.grid}>
        {BILL_TYPES.map(bill => (
          <TouchableOpacity
            key={bill.id}
            style={styles.billCard}
            onPress={() => handleSelectBill(bill)}
            activeOpacity={0.8}>
            <View style={[styles.billIconWrap, {backgroundColor: bill.bg}]}>
              <Icon name={bill.icon} size={28} color={bill.color} />
            </View>
            <Text style={styles.billLabel}>{bill.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  // ── Step 2: enter code + choose amount ────────────────────────────────
  const renderStep2 = () => (
    <>
      {/* Bill code */}
      <Text style={styles.sectionLabel}>Bill code</Text>
      <Text style={styles.hintText}>{selectedBill?.hint}</Text>
      <View style={styles.codeRow}>
        <Input
          placeholder="e.g. 123456789"
          value={billCode}
          onChangeText={v => { setBillCode(v); setCustomer(null); }}
          keyboardType="default"
          style={styles.codeInput}
        />
        <Button
          label={lookingUp ? '…' : 'Check'}
          onPress={handleLookup}
          disabled={billCode.trim().length < 4 || lookingUp}
          style={styles.checkBtn}
        />
      </View>

      {/* Customer info result */}
      {lookingUp && (
        <ActivityIndicator color={colors.primary} style={{marginBottom: spacing.md}} />
      )}
      {customer && !lookingUp && (
        <View style={styles.customerCard}>
          <Icon name="account-check" size={20} color={colors.success} />
          <View style={{flex: 1}}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerAddr}>{customer.address}</Text>
          </View>
        </View>
      )}

      {/* Amount presets */}
      {customer && (
        <>
          <Text style={[styles.sectionLabel, {marginTop: spacing.md}]}>
            Select amount
          </Text>
          <View style={styles.amountGrid}>
            {(selectedBill?.presets ?? []).map(a => (
              <TouchableOpacity
                key={a}
                onPress={() => { setSelectedAmount(a); setCustomAmount(''); }}
                style={[
                  styles.amountBtn,
                  selectedAmount === a && styles.amountBtnSelected,
                ]}>
                <Text style={[
                  styles.amountText,
                  selectedAmount === a && styles.amountTextSelected,
                ]}>
                  {fmt(a)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSelectedAmount('custom')}
              style={[
                styles.amountBtn,
                selectedAmount === 'custom' && styles.amountBtnSelected,
                {minWidth: '45%'},
              ]}>
              <Text style={[
                styles.amountText,
                selectedAmount === 'custom' && styles.amountTextSelected,
              ]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {selectedAmount === 'custom' && (
            <Input
              placeholder="Enter amount"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              style={{marginBottom: spacing.sm}}
            />
          )}

          {/* Tax preview */}
          {resolvedAmount > 0 && (
            <View style={styles.taxPreview}>
              <View style={styles.taxRow}>
                <Text style={styles.taxKey}>Amount</Text>
                <Text style={styles.taxVal}>{fmt(resolvedAmount)}</Text>
              </View>
              <View style={styles.taxRow}>
                <Text style={styles.taxKey}>Tax (10%)</Text>
                <Text style={styles.taxVal}>{fmt(tax)}</Text>
              </View>
              <View style={[styles.taxRow, styles.taxTotalRow]}>
                <Text style={styles.taxTotalKey}>Total</Text>
                <Text style={styles.taxTotalVal}>{fmt(total)}</Text>
              </View>
            </View>
          )}

          <Button
            label="Continue"
            onPress={() => setStep(3)}
            disabled={!step2Valid}
            style={{marginTop: spacing.sm}}
          />
        </>
      )}
    </>
  );

  // ── Step 3: card + OTP ────────────────────────────────────────────────
  const renderStep3 = () => (
    <>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIconWrap, {backgroundColor: selectedBill?.bg}]}>
          <Icon name={selectedBill?.icon} size={24} color={selectedBill?.color} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.summaryBillType}>{selectedBill?.label} Bill</Text>
          <Text style={styles.summaryCustomer}>{customer?.name}</Text>
          <Text style={styles.summarCode}>Code: {billCode}</Text>
        </View>
        <View style={styles.summaryAmountWrap}>
          <Text style={styles.summaryTotal}>{fmt(total)}</Text>
          <Text style={styles.summaryTaxNote}>incl. tax</Text>
        </View>
      </View>

      {/* Card picker */}
      <Text style={styles.sectionLabel}>Pay from card</Text>
      {cards.length === 0 ? (
        <Text style={styles.emptyNote}>No cards found. Add a card first.</Text>
      ) : (
        cards.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedCard(c)}
            style={[
              styles.cardOption,
              selectedCard?.id === c.id && styles.cardOptionSelected,
            ]}>
            <View style={styles.cardOptionLeft}>
              <Text style={styles.cardOptionName}>
                {c.holderName} · •••• {c.last4}
              </Text>
              <Text style={[
                styles.cardOptionBal,
                (c.balance ?? 0) < total && styles.cardOptionBalLow,
              ]}>
                Balance: {fmt(c.balance ?? 0)}
                {(c.balance ?? 0) < total ? '  ⚠ Insufficient' : ''}
              </Text>
            </View>
            {selectedCard?.id === c.id && (
              <Icon name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))
      )}

      {/* OTP */}
      <Text style={[styles.sectionLabel, {marginTop: spacing.md}]}>
        OTP verification
      </Text>
      <View style={styles.otpRow}>
        <Input
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          style={styles.otpInput}
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
        label={paying ? 'Processing…' : `Pay ${fmt(total)}`}
        onPress={handlePay}
        disabled={!step3Valid || paying || (selectedCard?.balance ?? 0) < total}
        loading={paying}
      />
    </>
  );

  return (
    <ScreenWrapper
      title={step === 1 ? 'Pay a Bill' : selectedBill?.label + ' Bill'}
      onBack={handleBack}>

      {/* Step indicator */}
      <Steps current={step} />

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScreenWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stepItem: {alignItems: 'center', gap: 4},
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {backgroundColor: colors.primary},
  stepDotDone:   {backgroundColor: colors.success},
  stepDotText:   {fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textMuted},
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.semiBold,
  },
  stepLabelActive: {color: colors.primary},
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
    marginHorizontal: 4,
  },
  stepLineDone: {backgroundColor: colors.success},

  // Step 1 grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  billCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  billIconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  // Step 2
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  codeInput: {flex: 1},
  checkBtn:  {width: 90, paddingHorizontal: 0},
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.success}12`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  customerName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  customerAddr: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amountBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: '28%',
    alignItems: 'center',
    flexGrow: 1,
  },
  amountBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  amountText:         {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  amountTextSelected: {color: '#fff'},
  taxPreview: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taxRow:     {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  taxKey:     {fontSize: fontSize.sm, color: colors.textSecondary},
  taxVal:     {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  taxTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  taxTotalKey: {fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text},
  taxTotalVal: {fontSize: fontSize.base, fontWeight: fontWeight.extraBold, color: colors.error},

  // Step 3
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  summaryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBillType:  {fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text},
  summaryCustomer:  {fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2},
  summarCode:       {fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2},
  summaryAmountWrap: {alignItems: 'flex-end'},
  summaryTotal:     {fontSize: fontSize.lg, fontWeight: fontWeight.extraBold, color: colors.error},
  summaryTaxNote:   {fontSize: fontSize.xs, color: colors.textMuted},
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  cardOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  cardOptionLeft:  {flex: 1},
  cardOptionName:  {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  cardOptionBal:   {fontSize: fontSize.sm, color: colors.success, marginTop: 2},
  cardOptionBalLow:{color: colors.error},
  emptyNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  otpRow:    {flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.md},
  otpInput:  {flex: 1},
  otpBtn:    {width: 'auto', paddingHorizontal: spacing.md},

  // Success
  successWrap:  {flex: 1, alignItems: 'center', paddingTop: spacing.lg},
  successIcon:  {marginBottom: spacing.md},
  successTitle: {fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.success, marginBottom: 4},
  successSub:   {fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg},
  receiptCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  receiptKey:          {fontSize: fontSize.sm, color: colors.textSecondary},
  receiptVal:          {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  receiptValHighlight: {color: colors.error, fontWeight: fontWeight.extraBold},
  receiptBalRow:       {borderBottomWidth: 0, marginTop: 4},
  receiptBal:          {fontSize: fontSize.sm, fontWeight: fontWeight.extraBold, color: colors.success},
});

export default BillsScreen;
