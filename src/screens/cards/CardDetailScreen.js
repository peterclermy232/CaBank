import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {BankCard} from '../../components/cards';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);

const CardDetailScreen = ({navigation, route}) => {
  const card = route.params?.card || {};

  const handleDelete = () => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <ScreenWrapper title="Card" onBack={() => navigation.goBack()}>
      <BankCard card={card} />
      <View style={styles.detailCard}>
        {[
          ['Name', card.holder],
          ['Card number', `•••• •••• ${card.last4}`],
          ['Valid from', card.validFrom],
          ['Good thru', card.goodThru],
          ['Available balance', fmt(card.balance)],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.key}>{k}</Text>
            <Text style={[styles.val, k === 'Available balance' && styles.valHighlight]}>{v}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>Delete card</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  detailCard: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border},
  row: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border},
  key: {fontSize: fontSize.sm, color: colors.textSecondary},
  val: {fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text},
  valHighlight: {color: colors.primary},
  deleteBtn: {alignItems: 'center', marginTop: spacing.xl},
  deleteText: {fontSize: fontSize.base, color: colors.error, fontWeight: fontWeight.semiBold},
});

export default CardDetailScreen;
