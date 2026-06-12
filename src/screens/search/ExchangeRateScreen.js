import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const ExchangeRateScreen = ({navigation}) => {
  const {exchangeRates, loadingData} = useData();

  return (
    <ScreenWrapper title="Exchange rate" onBack={() => navigation.goBack()}>
      {loadingData ? (
        <ActivityIndicator
          color={colors.primary}
          style={{marginTop: spacing.xl}}
        />
      ) : exchangeRates.length === 0 ? (
        <Text style={styles.emptyText}>No exchange rates available.</Text>
      ) : (
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, {flex: 2}]}>
              Country
            </Text>
            <Text style={[styles.cell, styles.headerCell]}>Buy</Text>
            <Text style={[styles.cell, styles.headerCell]}>Sell</Text>
          </View>
          {exchangeRates.map((r, i) => (
            <View
              key={r.id ?? r.currencyCode ?? i}
              style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
              <View style={styles.countryCell}>
                <Text style={styles.flag}>{r.flag ?? '🏳️'}</Text>
                <Text style={styles.country}>{r.country}</Text>
              </View>
              <Text style={styles.cell}>
                {Number(r.buyRate ?? r.buy).toFixed(2)}
              </Text>
              <Text style={styles.cell}>
                {Number(r.sellRate ?? r.sell).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowAlt: {backgroundColor: '#FAFAFA'},
  headerRow: {backgroundColor: colors.background},
  cell: {flex: 1, fontSize: fontSize.sm, color: colors.text, textAlign: 'right'},
  headerCell: {fontWeight: fontWeight.bold, color: colors.textSecondary},
  countryCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flag: {fontSize: 20},
  country: {fontSize: fontSize.sm, color: colors.text},
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default ExchangeRateScreen;