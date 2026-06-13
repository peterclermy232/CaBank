import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, borderRadius, fontSize, fontWeight, spacing} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n ?? 0);

const BankCard = ({card, onPress, selected = false, compact = false}) => {
  const isGold = card.color?.toUpperCase() === 'GOLD';
  const isCredit = card.cardType?.toUpperCase() === 'CREDIT';
  const bg = isGold ? '#E6A817' : colors.primaryDark;

  const hasBalance = (card.balance ?? 0) > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={[
        styles.card,
        compact && styles.compact,
        selected && styles.selected,
        {backgroundColor: bg},
      ]}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Text style={styles.type}>{card.cardType}</Text>
      <Text style={styles.holder}>{card.holderName}</Text>
      <Text style={styles.number}>•••• •••• •••• {card.last4}</Text>

      <View style={styles.footer}>
        <View>
          {isCredit ? (
            <>
              <Text style={styles.balLabel}>
                {hasBalance ? 'Used' : 'Available limit'}
              </Text>
              <Text style={styles.balance}>
                {hasBalance
                  ? `${fmt(card.balance)} / ${fmt(card.creditLimit)}`
                  : fmt(card.creditLimit)}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.balLabel}>
                {hasBalance ? 'Balance' : 'No balance'}
              </Text>
              <Text style={styles.balance}>
                {hasBalance ? fmt(card.balance) : '—'}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.brand}>{card.brand}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  compact: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  selected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  circle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -30,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    right: 40,
  },
  type: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 2,
  },
  holder: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginBottom: spacing.md,
  },
  number: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
  },
  balance: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: '#fff',
  },
  brand: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default BankCard;