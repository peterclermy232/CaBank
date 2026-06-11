import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Button, Input, ScreenWrapper} from '../../components/common';
import {mockSavings} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const fmt = n => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);

const SavingsScreen = ({navigation}) => {
  const [view, setView] = useState('menu'); // menu | add | manage
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);

  const handleBack = () => {
    if (view === 'menu') navigation.goBack();
    else if (step > 1) setStep(s => s - 1);
    else setView('menu');
  };

  if (done) return (
    <ScreenWrapper title="Save online" onBack={() => navigation.goBack()}>
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Save online successfully!</Text>
        <Text style={styles.successDesc}>Congratulations! You have saved money online successfully!</Text>
        <Button label="Confirm" onPress={() => navigation.goBack()} />
      </View>
    </ScreenWrapper>
  );

  return (
    <ScreenWrapper title="Save online" onBack={handleBack}>
      {view === 'menu' && (
        <>
          {[{id:'add',label:'Add',sub:'Add new save online account',icon:'➕'},{id:'manage',label:'Management',sub:'Manage your save online account',icon:'📊'}].map(it => (
            <TouchableOpacity key={it.id} onPress={() => setView(it.id)} style={styles.menuItem} activeOpacity={0.8}>
              <View style={styles.menuIcon}><Text style={styles.menuEmoji}>{it.icon}</Text></View>
              <View><Text style={styles.menuLabel}>{it.label}</Text><Text style={styles.menuSub}>{it.sub}</Text></View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {view === 'manage' && (
        <>
          {mockSavings.map(s => (
            <View key={s.id} style={styles.savingCard}>
              <View style={styles.savingRow}><Text style={styles.savingKey}>Account</Text><Text style={styles.savingAcct}>{s.account}</Text></View>
              {[['From',s.from],['To',s.to],['Time deposit',s.period],['Interest rate',`${s.rate}%`]].map(([k,v]) => (
                <View key={k} style={styles.savingRow}>
                  <Text style={styles.savingKey}>{k}</Text>
                  <Text style={styles.savingVal}>{v}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      )}

      {view === 'add' && step === 1 && (
        <>
          <Text style={styles.emoji}>🐷</Text>
          <Input label="Choose account/card" placeholder="Select account" value="" onChangeText={() => {}} editable={false} />
          <Input label="Choose time deposit" placeholder="Select period" value="" onChangeText={() => {}} editable={false} />
          <Input label="Amount (At least $1000)" placeholder="Enter amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Button label="Next" onPress={() => setStep(2)} disabled={!amount} style={styles.btn} />
        </>
      )}

      {view === 'add' && step === 2 && (
        <>
          <Text style={styles.emoji}>🐷</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Account 1900 8988 5456</Text>
            <Text style={styles.summaryBal}>Available balance: 10,005</Text>
            <Text style={styles.summaryRate}>Interest rate 5% / 12 months</Text>
            <Text style={styles.summaryAmount}>$ {amount}</Text>
          </View>
          <Button label="Verify" onPress={() => setDone(true)} />
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  menuItem: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md},
  menuIcon: {width: 50, height: 50, borderRadius: borderRadius.md, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center'},
  menuEmoji: {fontSize: 26},
  menuLabel: {fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 2},
  menuSub: {fontSize: fontSize.sm, color: colors.textSecondary},
  chevron: {fontSize: 22, color: colors.textMuted, marginLeft: 'auto'},
  savingCard: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border},
  savingRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs},
  savingKey: {fontSize: fontSize.sm, color: colors.textSecondary},
  savingAcct: {fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold},
  savingVal: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text},
  emoji: {fontSize: 64, textAlign: 'center', marginBottom: spacing.lg},
  btn: {marginTop: spacing.sm},
  summaryCard: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border},
  summaryTitle: {fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 4},
  summaryBal: {fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semiBold, marginBottom: 4},
  summaryRate: {fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semiBold, marginBottom: spacing.sm},
  summaryAmount: {fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.text},
  successContainer: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['2xl']},
  successEmoji: {fontSize: 72, marginBottom: spacing.lg},
  successTitle: {fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: colors.primary, marginBottom: spacing.sm},
  successDesc: {fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22},
});

export default SavingsScreen;
