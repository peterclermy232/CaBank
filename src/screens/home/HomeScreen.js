import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Avatar, TransactionRow} from '../../components/common';
import {BankCard} from '../../components/cards';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';


const QUICK_ACTIONS = [
  {id: 'accounts', label: 'Account\nand Card', icon: '💳', screen: 'Accounts'},
  {id: 'deposit', label: 'Deposit', icon: '💰', screen: 'Deposit'},
  {id: 'TopUp', label: 'TopUp', icon: '➕💰', screen: 'TopUp'},
  {id: 'transfer', label: 'Transfer', icon: '↗️', screen: 'Transfer'},
  {id: 'withdraw', label: 'Withdraw', icon: '💸', screen: 'Withdraw'},
  {id: 'prepaid', label: 'Mobile\nprepaid', icon: '📱', screen: 'Prepaid'},
  {id: 'bills', label: 'Pay the\nbill', icon: '📄', screen: 'Bills'},
  {id: 'savings', label: 'Save\nonline', icon: '🏦', screen: 'Savings'},
  {id: 'credit', label: 'Credit\ncard', icon: '🏷️', screen: 'CreditCard'},
  {id: 'report', label: 'Transaction\nreport', icon: '📊', screen: 'TransactionReport'},
  {id: 'beneficiary', label: 'Beneficiary', icon: '👥', screen: 'Beneficiary'},
];

// Normalise a transaction from the backend shape to what TransactionRow expects
const normaliseTransaction = tx => ({
  id: tx.id,
  title: tx.title,
  cat: tx.category ?? 'other',
  amount: tx.type === 'DEBIT' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
  day: tx.createdAt
    ? new Date(tx.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent',
  status: tx.status === 'SUCCESS' ? 'success' : tx.status === 'FAILED' ? 'failed' : 'success',
  emoji: tx.emoji ?? '💳',
});

// Normalise a card from backend shape to what BankCard expects
const normaliseCard = c => ({
  id: c.id,
  holder: c.holderName,
  brand: c.brand,
  type: c.cardType,
  number: `•••• •••• •••• ${c.last4}`,
  last4: c.last4,
  balance: c.balance ?? 0,
  validFrom: c.validFrom,
  goodThru: c.goodThru,
  color: (c.color ?? 'PRIMARY').toLowerCase(),
});

const HomeScreen = ({navigation}) => {
  const {user} = useAuth();
  const {cards: rawCards, transactions: rawTransactions, loadingData, refresh} = useData();
  const [cardIdx, setCardIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const cards = rawCards.map(normaliseCard);
  const transactions = rawTransactions.map(normaliseTransaction);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Group transactions by day label
  const grouped = transactions.reduce((acc, tx) => {
    const key = tx.day ?? 'Recent';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userRow}>
            <Avatar name={user?.name ?? '?'} size={40} />
            <View style={styles.userInfo}>
              <Text style={styles.hiText}>Hi,</Text>
              <Text style={styles.userName}>{user?.name ?? ''}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Messages')}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Cards carousel */}
        {loadingData ? (
          <ActivityIndicator color="#fff" style={{marginVertical: spacing.lg}} />
        ) : cards.length === 0 ? (
          <Text style={styles.noCardsText}>No cards yet</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsScroll}
            contentContainerStyle={styles.cardsContent}>
            {cards.map((card, idx) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => setCardIdx(idx)}
                style={[
                  styles.cardWrap,
                  idx < cards.length - 1 && {marginRight: spacing.md},
                ]}>
                <BankCard card={card} compact selected={cardIdx === idx} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.7}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {loadingData ? (
            <ActivityIndicator color={colors.primary} />
          ) : Object.keys(grouped).length === 0 ? (
            <Text style={styles.emptyText}>No recent transactions</Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primary},
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  userInfo: {},
  hiText: {fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)'},
  userName: {fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#fff'},
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {fontSize: 18},
  noCardsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  cardsScroll: {},
  cardsContent: {paddingRight: spacing.md},
  cardWrap: {width: 280},
  body: {flex: 1, backgroundColor: colors.background},
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  actionsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  actionItem: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionIcon: {fontSize: 24},
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
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
    paddingVertical: spacing.lg,
  },
});

export default HomeScreen;