import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Button, Input, ScreenWrapper, useToast} from '../../components/common';
import {useData} from '../../context/DataContext';
import {otpApi,withdrawalsApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);

const PRESET_AMOUNTS = [10, 50, 100, 150, 200];

const WithdrawScreen = ({navigation}) => {
  const toast = useToast();
  const {cards: rawCards, setCards} = useData();

  const cards = rawCards.map(c => ({
    id: c.id,
    last4: c.last4,
    holderName: c.holderName,
    balance: c.balance ?? 0,
  }));

  const [step, setStep]                 = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [phone, setPhone]               = useState('');
  const [amount, setAmount]             = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [otp, setOtp]                   = useState('');
  const [otpLoading, setOtpLoading]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);

  const activeCard = selectedCard ?? cards[0];

  const resolvedAmount =
    amount === 'other' ? parseFloat(customAmount || '0') : amount ?? 0;

  const isStep1Valid =
    !!phone &&
    !!amount &&
    (amount !== 'other' || (parseFloat(customAmount) > 0));

  const handleGetOtp = async () => {
    setOtpLoading(true);
    try {
      const result = await otpApi.request();
      if (result?.code) setOtp(result.code);
      toast.show('OTP sent to your registered phone', 'info');
    } catch (err) {
      Alert.alert('Failed to send OTP', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!otp || !activeCard || resolvedAmount <= 0) return;
    if (resolvedAmount > activeCard.balance) {
      Alert.alert('Insufficient balance', 'The withdrawal amount exceeds your card balance.');
      return;
    }

    setLoading(true);
    try {
      const result = await withdrawalsApi.create({
        cardId: activeCard.id,
        phone,
        amount: resolvedAmount,
        otpCode: otp,
      });

      // Sync balance from server response
      setCards(prev =>
        prev.map(c =>
          c.id === activeCard.id
            ? {...c, balance: result.newBalance}
            : c,
        ),
      );

      setDone(true);
    } catch (err) {
      Alert.alert('Withdrawal failed', err.message || 'Unable to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ScreenWrapper title="Withdraw" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>💸</Text>
          <Text style={styles.successTitle}>Withdrawal successful!</Text>
          <Text style={styles.successDesc}>
            {fmt(resolvedAmount)} will be sent to{'\n'}
            <Text style={styles.bold}>{phone}</Text>
          </Text>
          <Button label="Done" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title="Withdraw"
      onBack={() => (step > 1 ? setStep(1) : navigation.goBack())}>

      <Text style={styles.heroEmoji}>💰</Text>

      {step === 1 && (
        <>
          {/* Card picker */}
          <Text style={styles.sectionLabel}>Choose account / card</Text>
          {cards.length === 0 ? (
            <Text style={styles.emptyNote}>No cards found.</Text>
          ) : (
            cards.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCard(c)}
                style={[
                  styles.cardPicker,
                  activeCard?.id === c.id && styles.cardPickerSelected,
                ]}>
                <View>
                  <Text style={styles.cardNum}>
                    {c.holderName} · •••• {c.last4}
                  </Text>
                  <Text style={styles.cardBal}>
                    Available: {fmt(c.balance)}
                  </Text>
                </View>
                {activeCard?.id === c.id && (
                  <Text style={styles.check}>✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}

          {/* Phone */}
          <Input
            label="Send to phone number"
            placeholder="+254 712 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{marginTop: spacing.sm}}
          />

          {/* Amount grid */}
          <Text style={[styles.sectionLabel, {marginTop: spacing.sm}]}>
            Choose amount
          </Text>
          <View style={styles.amountGrid}>
            {PRESET_AMOUNTS.map(a => (
              <TouchableOpacity
                key={a}
                onPress={() => setAmount(a)}
                style={[
                  styles.amountBtn,
                  amount === a && styles.amountBtnSelected,
                ]}>
                <Text
                  style={[
                    styles.amountText,
                    amount === a && styles.amountTextSelected,
                  ]}>
                  ${a}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setAmount('other')}
              style={[
                styles.amountBtn,
                amount === 'other' && styles.amountBtnSelected,
              ]}>
              <Text
                style={[
                  styles.amountText,
                  amount === 'other' && styles.amountTextSelected,
                ]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>

          {amount === 'other' && (
            <Input
              label="Custom amount"
              placeholder="Enter amount"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              style={{marginBottom: spacing.sm}}
            />
          )}

          <Button
            label="Continue"
            onPress={() => setStep(2)}
            disabled={!isStep1Valid}
          />
        </>
      )}

      {step === 2 && (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Card</Text>
            <Text style={styles.summaryValue}>
              •••• {activeCard?.last4}
            </Text>
            <Text style={styles.summaryLabel}>Send to</Text>
            <Text style={styles.summaryValue}>{phone}</Text>
            <View style={styles.divider} />
            <Text style={styles.summaryAmount}>{fmt(resolvedAmount)}</Text>
          </View>

          {/* OTP */}
          <Text style={styles.sectionLabel}>OTP verification</Text>
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
            label={loading ? 'Processing…' : 'Confirm Withdrawal'}
            onPress={handleWithdraw}
            disabled={!otp || loading}
            loading={loading}
          />
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  heroEmoji: {fontSize: 64, textAlign: 'center', marginBottom: spacing.lg},
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  cardPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardPickerSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cardNum: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  cardBal: {fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semiBold, marginTop: 2},
  check: {fontSize: 18, color: colors.primary, fontWeight: fontWeight.bold},
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amountBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: '30%',
    alignItems: 'center',
    flexGrow: 1,
  },
  amountBtnSelected: {borderColor: colors.primary, backgroundColor: colors.primary},
  amountText: {fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.text},
  amountTextSelected: {color: '#fff'},
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryLabel: {color: colors.textSecondary, fontSize: fontSize.sm},
  summaryValue: {fontWeight: fontWeight.bold, marginBottom: spacing.sm, fontSize: fontSize.base},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: spacing.sm},
  summaryAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: colors.text,
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
  bold: {fontWeight: fontWeight.bold, color: colors.text},
});

export default WithdrawScreen;