import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {ScreenWrapper, Button, Input} from '../../components/common';
import {topUpApi, otpApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
    n ?? 0,
  );

const TopUpScreen = ({navigation}) => {
  const {cards, setCards} = useData();

  const [selectedCard, setSelectedCard] = useState(cards[0] ?? null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [newBalance, setNewBalance] = useState(null);

  const isValid = selectedCard && amount && otp;

  const handleGetOtp = async () => {
    setOtpLoading(true);
    try {
      await otpApi.request();
      Alert.alert('OTP sent', 'Check your registered email for the OTP code.');
    } catch (err) {
      Alert.alert('Failed to send OTP', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleTopUp = async () => {
    setLoading(true);
    try {
      const response = await topUpApi.topUp({
        cardId: selectedCard.id,
        amount: parseFloat(amount),
        note: note || undefined,
        otpCode: otp,
      });

      const result = response?.data ?? response;

      // Optimistically update card balance in context
      setCards(prev =>
        prev.map(c =>
          c.id === selectedCard.id
            ? {...c, balance: result.newBalance}
            : c,
        ),
      );

      setNewBalance(result.newBalance);
      setDone(true);
    } catch (err) {
      Alert.alert('Top-up failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ScreenWrapper title="Top Up" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Top-up successful!</Text>
          <Text style={styles.successDesc}>
            Your card ending in{' '}
            <Text style={styles.bold}>•••• {selectedCard?.last4}</Text> has
            been topped up with{' '}
            <Text style={styles.bold}>{fmt(parseFloat(amount))}</Text>.{'\n'}
            New balance:{' '}
            <Text style={[styles.bold, {color: colors.success}]}>
              {fmt(newBalance)}
            </Text>
          </Text>
          <Button label="Done" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Top Up Card" onBack={() => navigation.goBack()}>
      <View style={styles.container}>
        {/* Card selector */}
        <Text style={styles.label}>Select Card</Text>
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
              <Text style={styles.cardName}>
                {c.holderName} · •••• {c.last4}
              </Text>
              <Text style={styles.cardBalance}>
                Balance: {fmt(c.balance ?? 0)}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        <Input
          label="Note (Optional)"
          placeholder="e.g. Monthly top-up"
          value={note}
          onChangeText={setNote}
          style={styles.input}
        />

        {/* OTP row */}
        <Text style={styles.label}>OTP Verification</Text>
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
          label={loading ? 'Processing…' : 'Top Up'}
          onPress={handleTopUp}
          disabled={!isValid || loading}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {paddingTop: spacing.lg},
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  cardOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  cardOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cardName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
  },
  cardBalance: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.semiBold,
    marginTop: 2,
  },
  input: {marginBottom: spacing.md},
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

export default TopUpScreen;