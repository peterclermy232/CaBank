import React, {useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {ScreenWrapper, TransactionRow} from '../../components/common';
import {BankCard} from '../../components/cards';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';
import {normaliseCard} from '../../utils/normalise';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const BAR_HEIGHTS = [55, 38, 50, 88, 32, 65];

// const normaliseCard = c => ({
//   id: c.id,
//   holder: c.holderName,
//   brand: c.brand,
//   type: c.cardType,
//   number: `•••• •••• •••• ${c.last4}`,
//   last4: c.last4,
//   balance: c.balance ?? 0,
//   validFrom: c.validFrom,
//   goodThru: c.goodThru,
//   color: (c.color ?? 'PRIMARY').toLowerCase(),
// });

const normaliseTransaction = tx => ({
  id: tx.id,
  title: tx.title,
  cat: tx.category ?? 'other',
  amount: tx.type === 'DEBIT' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
  day: tx.createdAt
    ? new Date(tx.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
    : 'Recent',
  status: tx.status === 'SUCCESS' ? 'success' : tx.status === 'FAILED' ? 'failed' : 'success',
});

const TransactionReportScreen = ({navigation}) => {
  const {cards: rawCards, transactions: rawTxs, loadingData} = useData();
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);

  const cards = rawCards.map(normaliseCard);
  const transactions = rawTxs.map(normaliseTransaction);

  const grouped = transactions.reduce((acc, tx) => {
    if (!acc[tx.day]) acc[tx.day] = [];
    acc[tx.day].push(tx);
    return acc;
  }, {});

  // Simple total balance from all cards
  const totalBalance = rawCards.reduce((sum, c) => sum + (c.balance ?? 0), 0);

  return (
    <ScreenWrapper title="Transaction report" onBack={() => navigation.goBack()}>
      {loadingData ? (
        <ActivityIndicator color={colors.primary} style={{marginTop: spacing.xl}} />
      ) : (
        <>
          {cards.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSelectedCardIdx(i => (i + 1) % cards.length)
              }>
              <BankCard card={normaliseCard(cards[selectedCardIdx])} />
            </TouchableOpacity>
          )}

          {/* Balance chart */}
          <View style={styles.chartCard}>
            <View>
              <Text style={styles.balLabel}>Balance</Text>
              <Text style={styles.balAmount}>
                {totalBalance.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                })}{' '}
                <Text style={styles.balCurrency}>USD</Text>
              </Text>
            </View>
            <View style={styles.chart}>
              {MONTHS.map((m, i) => (
                <View key={m} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: BAR_HEIGHTS[i],
                        backgroundColor:
                          m === 'Apr'
                            ? colors.primary
                            : `${colors.primary}30`,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.barLabel,
                      m === 'Apr' && styles.barLabelActive,
                    ]}>
                    {m}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Transactions */}
          {Object.keys(grouped).length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            Object.entries(grouped).map(([day, txs]) => (
              <View key={day}>
                <Text style={styles.dayLabel}>{day}</Text>
                {txs.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </View>
            ))
          )}
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balLabel: {fontSize: fontSize.sm, color: colors.textSecondary},
  balAmount: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extraBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  balCurrency: {fontSize: fontSize.lg, color: colors.textSecondary},
  chart: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100},
  barCol: {flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end'},
  bar: {width: '100%', borderRadius: 4},
  barLabel: {fontSize: fontSize.xs, color: colors.textMuted},
  barLabelActive: {color: colors.primary, fontWeight: fontWeight.bold},
  dayLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default TransactionReportScreen;