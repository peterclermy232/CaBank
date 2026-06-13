import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
    Math.abs(n),
  );

const catBg = {
  income: '#E8F5E9',
  bill: '#FFF3E0',
  shopping: '#EDE7F6',
};

const catIcon = {
  income: 'cash-plus',
  bill: 'file-document-outline',
  shopping: 'cart-outline',
  transfer: 'bank-transfer',
  withdrawal: 'cash-minus',
  deposit: 'cash-plus',
  other: 'credit-card-outline',
};

const catIconColor = {
  income: colors.success,
  bill: colors.warning,
  shopping: colors.primary,
};

const TransactionRow = ({tx}) => (
  <View style={styles.row}>
    <View style={[styles.icon, {backgroundColor: catBg[tx.cat] || '#F0F0F0'}]}>
      <Icon
        name={catIcon[tx.cat] || catIcon.other}
        size={20}
        color={catIconColor[tx.cat] || colors.textSecondary}
      />
    </View>
    <View style={styles.info}>
      <Text style={styles.title}>{tx.title}</Text>
      <Text style={[styles.status, tx.status === 'failed' && styles.statusFailed]}>
        {tx.status === 'failed' ? 'Unsuccessfully' : 'Successfully'}
      </Text>
    </View>
    <Text
      style={[
        styles.amount,
        {
          color:
            tx.amount > 0
              ? colors.income
              : tx.status === 'failed'
              ? colors.textMuted
              : colors.expense,
        },
      ]}>
      {tx.amount > 0 ? '+' : '-'}
      {fmt(tx.amount)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  status: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statusFailed: {
    color: colors.error,
  },
  amount: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});

export default TransactionRow;