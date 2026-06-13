import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Avatar, TransactionRow, SkeletonCard, SkeletonRow} from '../../components/common';
import {BankCard} from '../../components/cards';
import {useAuth} from '../../context/AuthContext';
import {useData} from '../../context/DataContext';
import {normaliseCard} from '../../utils/normalise';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const QUICK_ACTIONS = [
  {id: 'accounts', label: 'Account\nand Card', icon: 'credit-card-outline', screen: 'Accounts'},
  {id: 'deposit',  label: 'Deposit',           icon: 'cash-plus',           screen: 'Deposit'},
  {id: 'TopUp',    label: 'Top Up',            icon: 'plus-circle-outline', screen: 'TopUp'},
  {id: 'transfer', label: 'Transfer',          icon: 'bank-transfer',       screen: 'Transfer'},
  {id: 'withdraw', label: 'Withdraw',          icon: 'cash-minus',          screen: 'Withdraw'},
  {id: 'prepaid',  label: 'Mobile\nprepaid',   icon: 'cellphone',           screen: 'Prepaid'},
  {id: 'bills',    label: 'Pay the\nbill',     icon: 'file-document-outline', screen: 'Bills'},
  {id: 'savings',  label: 'Save\nonline',      icon: 'piggy-bank-outline',  screen: 'Savings'},
  {id: 'credit',   label: 'Credit\ncard',      icon: 'credit-card-multiple-outline', screen: 'CreditCard'},
  {id: 'report',   label: 'Transaction\nreport', icon: 'chart-bar',         screen: 'TransactionReport'},
  {id: 'beneficiary', label: 'Beneficiary',   icon: 'account-group-outline', screen: 'Beneficiary'},
];

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

  const grouped = transactions.reduce((acc, tx) => {
    const key = tx.day ?? 'Recent';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userRow}>
            <Avatar name={user?.name ?? '?'} size={40} />
            <View>
              <Text style={styles.hiText}>Hi,</Text>
              <Text style={styles.userName}>{user?.name ?? ''}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Messages')}>
            <Icon name="bell-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Cards carousel — skeleton while loading */}
        {loadingData ? (
          <View style={styles.skeletonCardWrap}>
            <SkeletonCard />
          </View>
        ) : cards.length === 0 ? (
          <TouchableOpacity
            style={styles.noCardCta}
            onPress={() => navigation.navigate('Accounts')}>
            <View style={styles.noCardRow}>
              <Icon name="plus" size={16} color="rgba(255,255,255,0.75)" />
              <Text style={styles.noCardsText}>Add your first card</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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

      {/* ── Body ── */}
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
                <Icon name={action.icon} size={24} color={colors.primary} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions — skeleton while loading */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {loadingData ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : Object.keys(grouped).length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon name="credit-card-off-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No recent transactions</Text>
            </View>
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
  skeletonCardWrap: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  noCardCta: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noCardRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  noCardsText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
  },
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
  emptyWrap: {alignItems: 'center', paddingVertical: spacing.xl},
  emptyText: {fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm},
});

export default HomeScreen;