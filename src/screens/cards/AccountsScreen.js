import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScreenWrapper, Avatar, Button, SkeletonCard, SkeletonText} from '../../components/common';
import {BankCard} from '../../components/cards';
import {useAuth} from '../../context/AuthContext';
import {accountsApi, cardsApi} from '../../api/services';
import {normaliseCard} from '../../utils/normalise';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n ?? 0);

const AccountsScreen = ({navigation}) => {
  const {user} = useAuth();
  const [tab, setTab]           = useState('account');
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [accs, cds] = await Promise.all([
        accountsApi.list(),
        cardsApi.list(),
      ]);
      setAccounts(Array.isArray(accs) ? accs : accs?.data ?? []);
      setCards(Array.isArray(cds) ? cds : cds?.data ?? []);
    } catch (err) {
      console.warn('AccountsScreen load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <ScreenWrapper
      title="Account and card"
      onBack={() => navigation.goBack()}
      scrollable={false}>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['account', 'card'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {/* ── Account Tab ── */}
        {tab === 'account' && (
          <View>
            <View style={styles.profileRow}>
              <Avatar name={user?.name ?? ''} size={52} />
              <Text style={styles.profileName}>{user?.name ?? ''}</Text>
            </View>

            {loading ? (
              <>
                <SkeletonText height={80} style={{borderRadius: 12, marginBottom: 8}} />
                <SkeletonText height={80} style={{borderRadius: 12}} />
              </>
            ) : accounts.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="bank-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  You don't have any accounts yet.
                </Text>
                <Button
                  label="Open New Account"
                  onPress={() => navigation.navigate('CreateAccount')}
                />
              </View>
            ) : (
              <>
                {accounts.map(a => (
                  <View key={a.id} style={styles.accountCard}>
                    <Text style={styles.accountNumber}>
                      {a.accountNumber ?? a.number}
                    </Text>
                    <View style={styles.accountMeta}>
                      <Text style={styles.accountLabel}>
                        Available balance{' '}
                        <Text style={styles.accountBalance}>
                          {fmt(a.balance ?? 0)}
                        </Text>
                      </Text>
                      <Text style={styles.accountLabel}>
                        Branch{' '}
                        <Text style={styles.accountBranch}>{a.branch}</Text>
                      </Text>
                    </View>
                    <View style={[styles.typeBadge, styles[`type_${a.type?.toLowerCase()}`]]}>
                      <Text style={styles.typeBadgeText}>{a.type}</Text>
                    </View>
                  </View>
                ))}
                <Button
                  label="Open New Account"
                  onPress={() => navigation.navigate('CreateAccount')}
                  style={{marginTop: spacing.md}}
                />
              </>
            )}
          </View>
        )}

        {/* ── Card Tab ── */}
        {tab === 'card' && (
          <View>
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : cards.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="credit-card-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  You don't have any cards yet.
                </Text>
                <Button
                  label="Add Card"
                  onPress={() => navigation.navigate('CardDetail')}
                />
              </View>
            ) : (
              <>
                {cards.map(c => {
                  const normCard = normaliseCard(c);
                  return (
                    <TouchableOpacity
                      key={normCard.id}
                      onPress={() => navigation.navigate('CardDetail', {card: c})}
                      style={styles.cardWrap}>
                      <BankCard card={normCard} />
                    </TouchableOpacity>
                  );
                })}
                <Button
                  label="Add Card"
                  onPress={() => navigation.navigate('CardDetail')}
                  style={styles.addBtn}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.md,
    padding: 3,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textSecondary},
  tabTextActive: {color: colors.primary},
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  accountNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  accountMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  accountLabel: {fontSize: fontSize.sm, color: colors.textSecondary},
  accountBalance: {color: colors.success, fontWeight: fontWeight.bold},
  accountBranch: {color: colors.primary, fontWeight: fontWeight.semiBold},
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}15`,
  },
  type_savings: {backgroundColor: `${colors.success}15`},
  type_business: {backgroundColor: `${colors.warning}15`},
  typeBadgeText: {fontSize: fontSize.xs, fontWeight: fontWeight.semiBold, color: colors.primary},
  cardWrap: {marginBottom: spacing.md},
  addBtn: {marginTop: spacing.sm},
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AccountsScreen;