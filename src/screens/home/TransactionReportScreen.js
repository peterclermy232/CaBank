import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {ScreenWrapper, TransactionRow} from '../../components/common';
import {BankCard} from '../../components/cards';
import {mockCards, mockTransactions} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const BAR_HEIGHTS = [55, 38, 50, 88, 32, 65];

const TransactionReportScreen = ({navigation}) => {
  const grouped = mockTransactions.reduce((acc, tx) => {
    if (!acc[tx.day]) acc[tx.day] = [];
    acc[tx.day].push(tx);
    return acc;
  }, {});

  return (
    <ScreenWrapper title="Transaction report" onBack={() => navigation.goBack()}>
      <BankCard card={mockCards[0]} />

      {/* Balance chart */}
      <View style={styles.chartCard}>
        <View>
          <Text style={styles.balLabel}>Balance</Text>
          <Text style={styles.balAmount}>1000 <Text style={styles.balCurrency}>USD</Text></Text>
        </View>
        <View style={styles.chart}>
          {MONTHS.map((m, i) => (
            <View key={m} style={styles.barCol}>
              <View style={[styles.bar, {height: BAR_HEIGHTS[i], backgroundColor: m === 'Apr' ? colors.primary : `${colors.primary}30`}]} />
              <Text style={[styles.barLabel, m === 'Apr' && styles.barLabelActive]}>{m}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Transactions */}
      {Object.entries(grouped).map(([day, txs]) => (
        <View key={day}>
          <Text style={styles.dayLabel}>{day}</Text>
          {txs.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
        </View>
      ))}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  chartCard: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginVertical: spacing.md, borderWidth: 1, borderColor: colors.border},
  balLabel: {fontSize: fontSize.sm, color: colors.textSecondary},
  balAmount: {fontSize: fontSize['3xl'], fontWeight: fontWeight.extraBold, color: colors.text, marginBottom: spacing.md},
  balCurrency: {fontSize: fontSize.lg, color: colors.textSecondary},
  chart: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100},
  barCol: {flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end'},
  bar: {width: '100%', borderRadius: 4},
  barLabel: {fontSize: fontSize.xs, color: colors.textMuted},
  barLabelActive: {color: colors.primary, fontWeight: fontWeight.bold},
  dayLabel: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs},
});

export default TransactionReportScreen;
