import React, {useState, useEffect, useCallback} from 'react';
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
import {cardsApi, transactionsApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const QUICK_ACTIONS = [
  {id: 'accounts', label: 'Account\nand Card', icon: '💳', screen: 'Accounts'},
  {id: 'transfer', label: 'Transfer', icon: '↗️', screen: 'Transfer'},
  {id: 'withdraw', label: 'Withdraw', icon: '💸', screen: 'Withdraw'},
  {id: 'prepaid', label: 'Mobile\nprepaid', icon: '📱', screen: 'Prepaid'},
  {id: 'bills', label: 'Pay the\nbill', icon: '📄', screen: 'Bills'},
  {id: 'savings', label: 'Save\nonline', icon: '🏦', screen: 'Savings'},
  {id: 'credit', label: 'Credit\ncard', icon: '🏷️', screen: 'CreditCard'},
  {id: 'report', label: 'Transaction\nreport', icon: '📊', screen: 'TransactionReport'},
  {id: 'beneficiary', label: 'Beneficiary', icon: '👥', screen: 'Beneficiary'},
];

const HomeScreen = ({navigation}) => {
  const {user} = useAuth();
  const [cardIdx, setCardIdx] = useState(0);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cardsData, txData] = await Promise.all([
        cardsApi.list(),
        transactionsApi.recent(),
      ]);
      setCards(cardsData ?? []);
      setTransactions(txData ?? []);
    } catch (err) {
      console.warn('HomeScreen load error:', err.message);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Group transactions by day label
  const grouped = transactions.reduce((acc, tx) => {
    const key = tx.day ?? tx.date ?? 'Recent';
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
            <Avatar name={user?.name ?? ''} size={40} />
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
        {loading ? (
          <ActivityIndicator color="#fff" style={{marginVertical: spacing.lg}} />
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
          {Object.keys(grouped).length === 0 ? (
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