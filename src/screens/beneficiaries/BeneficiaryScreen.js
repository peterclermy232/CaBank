import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import {ScreenWrapper, Avatar} from '../../components/common';
import {beneficiariesApi} from '../../api/services';
import {useData} from '../../context/DataContext';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const BeneficiaryScreen = ({navigation}) => {
  const {beneficiaries, setBeneficiaries} = useData();

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

  return (
    <ScreenWrapper title="Beneficiaries" onBack={() => navigation.goBack()}>
      {/* Add button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('AddBeneficiary')}
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
});

export default BeneficiaryScreen;