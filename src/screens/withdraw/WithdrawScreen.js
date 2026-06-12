import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);
const AMOUNTS = [10, 50, 100, 150, 200];

const WithdrawScreen = ({navigation}) => {
  const {cards: rawCards} = useData();
  const cards = rawCards.map(c => ({
    id: c.id,
    last4: c.last4,
    balance: c.balance ?? 0,
  }));

  const [selectedCard, setSelectedCard] = useState(null);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(null);
  const [done, setDone] = useState(false);

  const activeCard = selectedCard ?? cards[0];

  if (done) {
    return (
      <ScreenWrapper title="Withdraw" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>💸</Text>
          <Text style={styles.successTitle}>Successful withdrawal!</Text>
          <Text style={styles.successDesc}>
            You have successfully withdrawn money! Please check the balance in
            the card management section.
          </Text>
          <Button label="Confirm" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Withdraw" onBack={() => navigation.goBack()}>
      <Text style={styles.emoji}>💰</Text>

      <Text style={styles.sectionLabel}>Choose account/card</Text>
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
              <Text style={styles.cardNum}>VISA •••• •••• {c.last4}</Text>
              <Text style={styles.cardBal}>
                Available balance: {fmt(c.balance)}
              </Text>
            </View>
            {activeCard?.id === c.id && (
              <Text style={styles.check}>✓</Text>
            )}
          </TouchableOpacity>
        ))
      )}

      <Input
        label="Phone number"
        placeholder="+254 712 345 678"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{marginTop: spacing.md}}
      />

      <Text style={styles.sectionLabel}>Choose amount</Text>
      <View style={styles.amountGrid}>
        {AMOUNTS.map(a => (
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
          placeholder="Enter custom amount"
          value=""
          onChangeText={() => {}}
          keyboardType="numeric"
          style={{marginTop: spacing.sm}}
        />
      )}

      <Button
        label="Verify"
        onPress={() => setDone(true)}
        disabled={!phone || !amount}
        style={styles.btn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  emoji: {fontSize: 64, textAlign: 'center', marginBottom: spacing.lg},
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
  cardNum: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
  },
  cardBal: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.semiBold,
  },
  check: {fontSize: 18, color: colors.primary, fontWeight: fontWeight.bold},
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  amountBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  amountText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
  },
  amountTextSelected: {color: '#fff'},
  btn: {marginTop: spacing.sm},
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

export default WithdrawScreen;