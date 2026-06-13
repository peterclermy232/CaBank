import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {ScreenWrapper, Button, Input} from '../../components/common';
import {BankCard} from '../../components/cards';
import {cardsApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';
import {normaliseCard} from '../../utils/normalise';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
    n ?? 0,
  );

// ─── Create mode ─────────────────────────────────────────────────────────────
const BRANDS = ['VISA', 'Mastercard', 'American Express'];
const CARD_TYPES = ['DEBIT', 'CREDIT', 'PREPAID'];

const CreateCardScreen = ({navigation}) => {
  const [holderName, setHolderName] = useState('');
  const [brand, setBrand] = useState('VISA');
  const [cardType, setCardType] = useState('DEBIT');
  const [validFrom, setValidFrom] = useState('');
  const [goodThru, setGoodThru] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid =
    holderName.trim() &&
    validFrom.match(/^\d{2}\/\d{2}$/) &&
    goodThru.match(/^\d{2}\/\d{2}$/);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await cardsApi.add({holderName, brand, cardType, validFrom, goodThru});
      Alert.alert('Card added', 'Your new card has been added successfully.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err) {
      Alert.alert('Failed to add card', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper title="Add card" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Card holder name</Text>
        <Input
          placeholder="Full name on card"
          value={holderName}
          onChangeText={setHolderName}
          autoCapitalize="words"
        />

        <Text style={styles.sectionLabel}>Card brand</Text>
        <View style={styles.chipRow}>
          {BRANDS.map(b => (
            <TouchableOpacity
              key={b}
              onPress={() => setBrand(b)}
              style={[styles.chip, brand === b && styles.chipSelected]}>
              <Text
                style={[
                  styles.chipText,
                  brand === b && styles.chipTextSelected,
                ]}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Card type</Text>
        <View style={styles.chipRow}>
          {CARD_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setCardType(t)}
              style={[styles.chip, cardType === t && styles.chipSelected]}>
              <Text
                style={[
                  styles.chipText,
                  cardType === t && styles.chipTextSelected,
                ]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.sectionLabel}>Valid from</Text>
            <Input
              placeholder="MM/YY"
              value={validFrom}
              onChangeText={setValidFrom}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.sectionLabel}>Good thru</Text>
            <Input
              placeholder="MM/YY"
              value={goodThru}
              onChangeText={setGoodThru}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        <Button
          label={loading ? 'Adding card…' : 'Add card'}
          onPress={handleAdd}
          disabled={!isValid || loading}
          loading={loading}
          style={styles.btn}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

// ─── Detail mode ─────────────────────────────────────────────────────────────
const CardDetailScreen = ({navigation, route}) => {
  const card = route.params?.card;

  if (!card) {
    return <CreateCardScreen navigation={navigation} />;
  }

  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('Delete card', 'Are you sure you want to remove this card?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await cardsApi.delete(card.id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Failed to delete', err.message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper title="Card details" onBack={() => navigation.goBack()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BankCard card={normaliseCard(card)} />

        <View style={styles.detailCard}>
          {[
            ['Name', card.holderName],
            ['Card number', `•••• •••• •••• ${card.last4}`],
            ['Card type', card.cardType],
            ['Brand', card.brand],
            ['Valid from', card.validFrom],
            ['Good thru', card.goodThru],
            ['Available balance', fmt(card.balance)],
          ].map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.key}>{k}</Text>
              <Text
                style={[
                  styles.val,
                  k === 'Available balance' && styles.valHighlight,
                ]}>
                {v}
              </Text>
            </View>
          ))}
        </View>

        {/* Top Up */}
        <Button
          label="Top Up Card"
          onPress={() => navigation.navigate('TopUp', {cardId: card.id})}
          style={styles.topUpBtn}
        />

        {/* Delete */}
        {deleting ? (
          <ActivityIndicator
            color={colors.error}
            style={{marginTop: spacing.xl}}
          />
        ) : (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Delete card</Text>
          </TouchableOpacity>
        )}

        {/* Bottom padding so delete link isn't flush against screen edge */}
        <View style={{height: spacing.xl}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  // Detail
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  key: {fontSize: fontSize.sm, color: colors.textSecondary},
  val: {fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text},
  valHighlight: {color: colors.primary},
  topUpBtn: {marginTop: spacing.md},
  deleteBtn: {alignItems: 'center', marginTop: spacing.xl},
  deleteText: {
    fontSize: fontSize.base,
    color: colors.error,
    fontWeight: fontWeight.semiBold,
  },

  // Create
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
  },
  chipTextSelected: {color: colors.primary},
  dateRow: {flexDirection: 'row', gap: spacing.md},
  dateField: {flex: 1},
  btn: {marginTop: spacing.lg},
});

export default CardDetailScreen;