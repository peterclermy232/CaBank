import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button, Input, ScreenWrapper, Avatar, useToast} from '../../components/common';
import {useData} from '../../context/DataContext';
import {transfersApi, otpApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
    Math.abs(n),
  );

const TX_TYPES = [
  {id: 'card',  label: 'Transfer via\ncard number', icon: 'credit-card-outline'},
  {id: 'same',  label: 'Transfer to\nsame bank',    icon: 'bank-outline'},
  {id: 'other', label: 'Transfer to\nanother bank', icon: 'bank-transfer'},
];

const TransferScreen = ({navigation}) => {
  const toast = useToast();
  const {cards: rawCards, beneficiaries} = useData();

  const cards = rawCards.map(c => ({
    id: c.id,
    last4: c.last4,
    holderName: c.holderName,
    balance: c.balance ?? 0,
  }));

  const [step, setStep]                 = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [txType, setTxType]             = useState('card');
  const [beneficiary, setBeneficiary]   = useState(null);
  const [amount, setAmount]             = useState('');
  const [note, setNote]                 = useState('');
  const [otp, setOtp]                   = useState('');
  const [otpLoading, setOtpLoading]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);

  const activeCard = selectedCard ?? cards[0];

  const handleGetOtp = async () => {
    setOtpLoading(true);
    try {
      const result = await otpApi.request();
      if (result?.code) setOtp(result.code);
      toast.show('OTP sent to your registered phone', 'info');
    } catch (err) {
      Alert.alert('Failed to send OTP', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!beneficiary || !amount || !activeCard || !otp) return;
    setLoading(true);
    try {
      await transfersApi.create({
        fromCardLast4: activeCard.last4,
        toAccountNumber: beneficiary.accountNumber ?? beneficiary.number ?? '',
        beneficiaryName: beneficiary.name,
        amount: parseFloat(amount),
        note: note || undefined,
        otpCode: otp,
      });
      setDone(true);
    } catch (err) {
      Alert.alert('Transfer failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ScreenWrapper title="Confirm" onBack={() => navigation.goBack()}>
        <View style={styles.successContainer}>
          <Icon name="check-circle-outline" size={72} color={colors.success} />
          <Text style={styles.successTitle}>Transfer successful!</Text>
          <Text style={styles.successDesc}>
            You transferred{' '}
            <Text style={styles.bold}>
              {fmt(parseFloat(amount) || 0)}
            </Text>{' '}
            to{' '}
            <Text style={styles.bold}>
              {beneficiary?.name || 'recipient'}
            </Text>
          </Text>
          <Button label="Done" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={step === 1 ? 'Transfer' : 'Confirm'}
      onBack={() => (step > 1 ? setStep(1) : navigation.goBack())}>

      {step === 1 && (
        <View>
          {/* Card selector */}
          <Text style={styles.sectionLabel}>Choose account / card</Text>
          {cards.length === 0 ? (
            <Text style={styles.emptyNote}>No cards found. Add a card first.</Text>
          ) : (
            cards.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCard(c)}
                style={[
                  styles.cardOption,
                  activeCard?.id === c.id && styles.cardOptionSelected,
                ]}>
                <Text style={styles.cardOptionNum}>
                  {c.holderName} · •••• {c.last4}
                </Text>
                <Text style={styles.cardOptionBal}>
                  Available balance: {fmt(c.balance)}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {/* TX Type */}
          <Text style={[styles.sectionLabel, {marginTop: spacing.md}]}>
            Choose transaction type
          </Text>
          <View style={styles.txTypeRow}>
            {TX_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTxType(t.id)}
                style={[
                  styles.txTypeItem,
                  txType === t.id && styles.txTypeItemSelected,
                ]}>
                <Icon
                  name={t.icon}
                  size={22}
                  color={txType === t.id ? colors.warning : colors.textSecondary}
                />
                <Text style={styles.txTypeLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Beneficiary */}
          <Text style={styles.sectionLabel}>Choose beneficiary</Text>
          {beneficiaries.length === 0 ? (
            <Text style={styles.emptyNote}>No beneficiaries saved yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.benScroll}>
              {beneficiaries.map(b => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setBeneficiary(b)}
                  style={styles.benItem}>
                  <Avatar
                    name={b.name}
                    size={46}
                    style={beneficiary?.id === b.id ? styles.benAvatarSelected : undefined}
                  />
                  <Text style={styles.benName}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Input
            label="Name"
            placeholder="Beneficiary name"
            value={beneficiary?.name || ''}
            onChangeText={() => {}}
            editable={false}
          />
          <Input
            label="Account number"
            placeholder="Account / card number"
            value={beneficiary?.accountNumber ?? beneficiary?.number ?? ''}
            onChangeText={() => {}}
            editable={false}
          />
          <Input
            label="Amount"
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Input
            label="Note"
            placeholder="Note / Content"
            value={note}
            onChangeText={setNote}
          />
          <Button
            label="Continue"
            onPress={() => setStep(2)}
            disabled={!beneficiary || !amount}
          />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.sectionLabel}>Confirm transaction</Text>
          {[
            ['From',           `•••• •••• ${activeCard?.last4 ?? '????'}`],
            ['To',             beneficiary?.name || ''],
            ['Account number', beneficiary?.accountNumber ?? beneficiary?.number ?? ''],
            ['Transaction fee','$10'],
            ['Content',        note || '—'],
            ['Amount',         fmt(parseFloat(amount) || 0)],
          ].map(([k, v]) => (
            <View key={k} style={styles.confirmRow}>
              <Text style={styles.confirmKey}>{k}</Text>
              <View style={styles.confirmVal}>
                <Text style={styles.confirmValText}>{v}</Text>
              </View>
            </View>
          ))}

          <Text style={[styles.sectionLabel, {marginTop: spacing.md}]}>
            OTP verification
          </Text>
          <View style={styles.otpRow}>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              style={styles.otpInput}
              keyboardType="number-pad"
            />
            <Button
              label={otpLoading ? 'Sending…' : 'Get OTP'}
              variant="outline"
              onPress={handleGetOtp}
              disabled={otpLoading}
              style={styles.otpBtn}
            />
          </View>

          <Button
            label={loading ? 'Processing…' : 'Confirm Transfer'}
            onPress={handleConfirm}
            disabled={!otp || loading}
            loading={loading}
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  cardOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  cardOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cardOptionNum: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  cardOptionBal: {fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semiBold},
  txTypeRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  txTypeItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  txTypeItemSelected: {
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}15`,
  },
  txTypeLabel: {fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center'},
  benScroll: {marginBottom: spacing.md},
  benItem: {alignItems: 'center', marginRight: spacing.lg, gap: spacing.xs},
  benAvatarSelected: {borderWidth: 3, borderColor: colors.primaryDark},
  benName: {fontSize: fontSize.xs, color: colors.textSecondary},
  confirmRow: {marginBottom: spacing.sm},
  confirmKey: {fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 4},
  confirmVal: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  confirmValText: {fontSize: fontSize.base, fontWeight: fontWeight.semiBold, color: colors.text},
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  otpInput: {flex: 1},
  otpBtn: {width: 'auto', paddingHorizontal: spacing.md},
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['2xl'],
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  successDesc: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  bold: {fontWeight: fontWeight.bold, color: colors.text},
});

export default TransferScreen;