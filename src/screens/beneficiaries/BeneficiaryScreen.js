import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {ScreenWrapper, Button, Input, Avatar} from '../../components/common';
import {beneficiariesApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const BeneficiaryScreen = ({navigation}) => {
  const {beneficiaries, setBeneficiaries} = useData();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setAccountNumber('');
    setBankName('');
    setShowForm(false);
  };

  // ── Add beneficiary ────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!name.trim() || !accountNumber.trim()) return;
    setSaving(true);
    try {
      const newBen = await beneficiariesApi.add({
        name: name.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim() || undefined,
      });
      // Optimistically update DataContext so TransferScreen picks it up too
      setBeneficiaries(prev => [...prev, newBen]);
      resetForm();
    } catch (err) {
      Alert.alert('Failed to add', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete beneficiary ─────────────────────────────────────────────────────
  const handleDelete = item => {
    Alert.alert(
      'Remove beneficiary',
      `Remove ${item.name} from your beneficiaries?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await beneficiariesApi.delete(item.id);
              setBeneficiaries(prev => prev.filter(b => b.id !== item.id));
            } catch (err) {
              Alert.alert('Failed to remove', err.message);
            }
          },
        },
      ],
    );
  };

  const isFormValid = name.trim() && accountNumber.trim();

  return (
    <ScreenWrapper title="Beneficiaries" onBack={() => navigation.goBack()}>
      {/* Add button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowForm(true)}
        activeOpacity={0.8}>
        <Text style={styles.addBtnIcon}>＋</Text>
        <Text style={styles.addBtnText}>Add new beneficiary</Text>
      </TouchableOpacity>

      {/* List */}
      {beneficiaries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>No beneficiaries yet</Text>
          <Text style={styles.emptySub}>
            Add someone you transfer to often so you can reach them quickly.
          </Text>
        </View>
      ) : (
        <FlatList
          data={beneficiaries}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Avatar name={item.name} size={46} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.acct}>{item.accountNumber}</Text>
                {item.bankName ? (
                  <Text style={styles.bank}>{item.bankName}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}

      {/* Add form modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        onRequestClose={resetForm}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New beneficiary</Text>

            <Input
              label="Full name"
              placeholder="Recipient's name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Input
              label="Account number"
              placeholder="e.g. 1234567890"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />
            <Input
              label="Bank name (optional)"
              placeholder="e.g. CaBank, Chase"
              value={bankName}
              onChangeText={setBankName}
            />

            <View style={styles.sheetActions}>
              <Button
                label="Cancel"
                variant="outline"
                onPress={resetForm}
                style={styles.cancelBtn}
              />
              <Button
                label={saving ? 'Saving…' : 'Add'}
                onPress={handleAdd}
                disabled={!isFormValid || saving}
                loading={saving}
                style={styles.saveBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: `${colors.primary}40`,
    borderStyle: 'dashed',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  addBtnIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  addBtnText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontWeight: fontWeight.semiBold,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  info: {flex: 1},
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  acct: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  bank: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {padding: spacing.xs},
  deleteIcon: {fontSize: 18},
  sep: {height: 1, backgroundColor: colors.border},
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {fontSize: 52, marginBottom: spacing.md},
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {flex: 1},
  saveBtn: {flex: 1},
});

export default BeneficiaryScreen;