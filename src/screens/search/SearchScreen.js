import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const SEARCH_ITEMS = [
  {id: 'Branch', label: 'Branch', sub: 'Search for branch', icon: '🏦', screen: 'Branch'},
  {id: 'InterestRate', label: 'Interest rate', sub: 'Search for interest rate', icon: '📈', screen: 'InterestRate'},
  {id: 'ExchangeRate', label: 'Exchange rate', sub: 'Search for exchange rate', icon: '💱', screen: 'ExchangeRate'},
  {id: 'Exchange', label: 'Exchange', sub: 'Exchange amount of money', icon: '🔄', screen: 'Exchange'},
];

const SearchScreen = ({navigation}) => (
  <ScreenWrapper title="Search">
    {SEARCH_ITEMS.map(item => (
      <TouchableOpacity key={item.id} style={styles.item} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.8}>
        <View style={styles.iconWrap}><Text style={styles.icon}>{item.icon}</Text></View>
        <View style={styles.info}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.sub}>{item.sub}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ))}
  </ScreenWrapper>
);

const styles = StyleSheet.create({
  item: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, ...shadows.sm},
  iconWrap: {width: 52, height: 52, borderRadius: borderRadius.md, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md},
  icon: {fontSize: 26},
  info: {flex: 1},
  label: {fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 2},
  sub: {fontSize: fontSize.sm, color: colors.textSecondary},
  chevron: {fontSize: 24, color: colors.textMuted},
});

export default SearchScreen;
