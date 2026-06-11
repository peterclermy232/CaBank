import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {ScreenWrapper, Avatar, Button} from '../../components/common';
import {BankCard} from '../../components/cards';
import {mockAccounts, mockCards, mockUser} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const fmt = n => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);

const AccountsScreen = ({navigation}) => {
  const [tab, setTab] = useState('account');

  return (
    <ScreenWrapper title="Account and card" onBack={() => navigation.goBack()}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['account', 'card'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'account' && (
        <View>
          <View style={styles.profileRow}>
            <Avatar name={mockUser.name} size={52} />
            <Text style={styles.profileName}>{mockUser.name}</Text>
          </View>
          {mockAccounts.map(a => (
            <View key={a.id} style={styles.accountCard}>
              <Text style={styles.accountNumber}>{a.number}</Text>
              <View style={styles.accountMeta}>
                <Text style={styles.accountLabel}>Available balance{' '}
                  <Text style={styles.accountBalance}>{fmt(a.balance)}</Text>
                </Text>
                <Text style={styles.accountLabel}>Branch{' '}
                  <Text style={styles.accountBranch}>{a.branch}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {tab === 'card' && (
        <View>
          {mockCards.map(c => (
            <TouchableOpacity key={c.id} onPress={() => navigation.navigate('CardDetail', {card: c})} style={styles.cardWrap}>
              <BankCard card={c} />
            </TouchableOpacity>
          ))}
          <Button label="Add card" onPress={() => {}} style={styles.addBtn} />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  tabContainer: {flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: borderRadius.md, padding: 3, marginBottom: spacing.lg},
  tab: {flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.sm - 2},
  tabActive: {backgroundColor: colors.surface, ...shadows.sm},
  tabText: {fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.textSecondary},
  tabTextActive: {color: colors.primary},
  profileRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg},
  profileName: {fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary},
  accountCard: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadows.sm},
  accountNumber: {fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm},
  accountMeta: {flexDirection: 'row', justifyContent: 'space-between'},
  accountLabel: {fontSize: fontSize.sm, color: colors.textSecondary},
  accountBalance: {color: colors.success, fontWeight: fontWeight.bold},
  accountBranch: {color: colors.primary, fontWeight: fontWeight.semiBold},
  cardWrap: {marginBottom: spacing.md},
  addBtn: {marginTop: spacing.sm},
});

export default AccountsScreen;
