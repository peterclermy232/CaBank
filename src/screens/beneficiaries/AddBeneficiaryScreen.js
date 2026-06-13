import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {ScreenWrapper, Button, Input} from '../../components/common';
import {beneficiariesApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const AddBeneficiaryScreen = ({navigation}) => {
  const {setBeneficiaries} = useData();

  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [saving, setSaving] = useState(false);

  const accountRef = useRef(null);
  const bankRef = useRef(null);

  const isFormValid = name.trim() && accountNumber.trim();

  const handleAdd = async () => {
    if (!isFormValid) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      const newBen = await beneficiariesApi.add({
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim() || undefined,
      });
      setBeneficiaries(prev => [...prev, newBen]);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Failed to add', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper title="New Beneficiary" onBack={() => navigation.goBack()}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Icon header */}
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <Text style={styles.subtitle}>
            Add someone you transfer to often so you can reach them quickly.
          </Text>

          {/* Form fields */}
          <View style={styles.form}>
            <Input
              label="Full name"
              placeholder="Recipient's name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => accountRef.current?.focus()}
            />
            <Input
              ref={accountRef}
              label="Account number"
              placeholder="e.g. 1234567890"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => bankRef.current?.focus()}
            />
            <Input
              ref={bankRef}
              label="Bank name (optional)"
              placeholder="e.g. CaBank, Chase"
              value={bankName}
              onChangeText={setBankName}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelBtn}
            />
            <Button
              label={saving ? 'Saving…' : 'Add beneficiary'}
              onPress={handleAdd}
              disabled={!isFormValid || saving}
              loading={saving}
              style={styles.saveBtn}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full ?? 36,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  icon: {
    fontSize: 34,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  form: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {flex: 1},
  saveBtn: {flex: 2},
});

export default AddBeneficiaryScreen;