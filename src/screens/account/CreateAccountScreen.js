import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {ScreenWrapper, Button, Input} from '../../components/common';
import {accountsApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const ACCOUNT_TYPES = ['CHECKING', 'SAVINGS', 'BUSINESS'];

const CreateAccountScreen = ({navigation}) => {
  const {setAccounts} = useData();

  const [branch, setBranch] = useState('');
  const [type, setType] = useState('SAVINGS');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = branch.trim().length > 0 && !!type;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await accountsApi.create({
        branch: branch.trim(),
        type,
        initialDeposit: initialDeposit ? parseFloat(initialDeposit) : undefined,
      });

      // Unwrap .data since API returns { success, message, data: {...} }
      const account = response?.data ?? response;
      setAccounts(prev => [...(prev ?? []), account]);

      Alert.alert('Success', 'Account created successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper title="Open New Account" onBack={() => navigation.goBack()}>
      <View style={styles.container}>
        <Input
          label="Branch"
          placeholder="e.g. Main Branch"
          value={branch}
          onChangeText={setBranch}
          style={styles.input}
        />

        <Text style={styles.label}>Account Type</Text>
        <View style={styles.typeRow}>
          {ACCOUNT_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.typeOption,
                type === t && styles.typeOptionSelected,
              ]}>
              <Text
                style={[
                  styles.typeText,
                  type === t && styles.typeTextSelected,
                ]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Initial Deposit (Optional)"
          placeholder="0.00"
          value={initialDeposit}
          onChangeText={setInitialDeposit}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          label={loading ? 'Creating...' : 'Create Account'}
          onPress={handleCreate}
          disabled={!isValid || loading}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  typeText: {
    fontWeight: fontWeight.semiBold,
    color: colors.textSecondary,
  },
  typeTextSelected: {
    color: colors.primary,
  },
});

export default CreateAccountScreen;