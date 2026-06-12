import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {billsApi, otpApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const BILLS = [
  {id: 'electric', label: 'Electric bill', sub: 'Pay electric bill this month', icon: '⚡'},
  {id: 'water', label: 'Water bill', sub: 'Pay water bill this month', icon: '💧'},
  {id: 'mobile', label: 'Mobile bill', sub: 'Pay mobile bill this month', icon: '📱'},
  {id: 'internet', label: 'Internet bill', sub: 'Pay internet bill this month', icon: '🌐'},
];

const BillsScreen = ({navigation}) => {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0); // 0=list, 1=code, 2=details, 3=success
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const BILL_AMOUNT = 470.0;
  const BILL_TAX = 10.0;

  const handleBack = () => {
    if (step === 0) navigation.goBack();
    else if (step > 0) setStep(s => s - 1);
    if (step === 1) setSelected(null);
  };

  const handleGetOtp = async () => {
  setOtpLoading(true);
  try {
    const result = await otpApi.request();
    setOtp(result?.code ?? '');
  } catch (err) {
    Alert.alert('Failed to send code', err.message);
  } finally {
    setOtpLoading(false);
  }
};

  const handlePayBill = async () => {
    if (!selected || !code || !otp) return;
    setLoading(true);
    try {
      await billsApi.pay({
        billType: selected.id,
        billCode: code,
        customerName: 'Jackson Maine',
        customerAddress: '403 East 4th Street, Santa Ana',
        amount: BILL_AMOUNT,
        otpCode: otp,
      });
      setStep(3);
    } catch (err) {
      Alert.alert('Payment failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <ScreenWrapper
        title={selected?.label || 'Bill'}
        onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Transaction successfully!</Text>
          <Text style={styles.successDesc}>
            You've paid your {selected?.label}!
          </Text>
          <Button label="Confirm" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={step === 0 ? 'Pay the bill' : selected?.label || 'Bill'}
      onBack={handleBack}>
      {step === 0 &&
        BILLS.map(b => (
          <TouchableOpacity
            key={b.id}
            style={styles.billItem}
            onPress={() => {
              setSelected(b);
              setStep(1);
            }}
            activeOpacity={0.8}>
            <View style={styles.billIcon}>
              <Text style={styles.billEmoji}>{b.icon}</Text>
            </View>
            <View style={styles.billInfo}>
              <Text style={styles.billLabel}>{b.label}</Text>
              <Text style={styles.billSub}>{b.sub}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

      {step === 1 && (
        <View>
          <Input
            label="Type bill code"
            placeholder="Bill code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <Text style={styles.hint}>
            Please enter the correct bill code to check information.
          </Text>
          <Button label="Check" onPress={() => setStep(2)} disabled={!code} />
        </View>
      )}

      {step === 2 && (
        <View>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>All the Bills</Text>
            {[
              ['Name', 'Jackson Maine'],
              ['Address', '403 East 4th Street, Santa Ana'],
              ['Phone number', '+84245897721'],
              ['Code', `#${code}`],
            ].map(([k, v]) => (
              <View key={k} style={styles.detailRow}>
                <Text style={styles.detailKey}>{k}</Text>
                <Text style={styles.detailVal}>{v}</Text>
              </View>
            ))}
            <View style={styles.feeRow}>
              <Text style={styles.detailKey}>{selected?.label} fee</Text>
              <Text style={styles.feeAmt}>${BILL_AMOUNT}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.detailKey}>Tax</Text>
              <Text style={styles.feeAmt}>${BILL_TAX}</Text>
            </View>
            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmt}>
                ${BILL_AMOUNT + BILL_TAX}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Choose account/card</Text>
          <View style={styles.cardPicker}>
            <Text style={styles.cardPickerText}>VISA •••• •••• 1234</Text>
          </View>

          <View style={styles.otpRow}>
            <Input
              placeholder="OTP"
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
            label={loading ? 'Processing…' : 'Pay the bill'}
            onPress={handlePayBill}
            disabled={!otp || loading}
            loading={loading}
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  billIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  billEmoji: {fontSize: 26},
  billInfo: {flex: 1},
  billLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  billSub: {fontSize: fontSize.sm, color: colors.textSecondary},
  chevron: {fontSize: 22, color: colors.textMuted},
  hint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailKey: {fontSize: fontSize.sm, color: colors.textSecondary},
  detailVal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  feeAmt: {fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.error},
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  totalAmt: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.extraBold,
    color: colors.error,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardPicker: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardPickerText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semiBold,
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
  },
});

export default BillsScreen;