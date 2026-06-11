import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {ScreenWrapper, Avatar, Button} from '../../components/common';
import {mockUser} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const MENU_ITEMS = [
  {id: 'password', label: 'Password', icon: '🔒'},
  {id: 'touchId', label: 'Touch ID', icon: '👆'},
  {id: 'languages', label: 'Languages', icon: '🌍'},
  {id: 'appInfo', label: 'App information', icon: 'ℹ️'},
  {id: 'care', label: 'Customer care', icon: '📞', sub: '18008981'},
];

const SettingsScreen = ({navigation}) => {
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: () => navigation.replace('Auth')},
    ]);
  };

  return (
    <ScreenWrapper title="Setting">
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Avatar name={mockUser.name} size={60} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{mockUser.name}</Text>
          <Text style={styles.profileEmail}>{mockUser.email}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
            activeOpacity={0.7}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.sub ? (
              <Text style={styles.menuSub}>{item.sub}</Text>
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Button label="Sign Out" variant="outline" onPress={handleSignOut} style={styles.signOutBtn} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  profileCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.md},
  profileInfo: {},
  profileName: {fontSize: fontSize.xl, fontWeight: fontWeight.extraBold, color: '#fff'},
  profileEmail: {fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  menuCard: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginBottom: spacing.lg, ...shadows.sm},
  menuItem: {flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md},
  menuItemBorder: {borderBottomWidth: 1, borderBottomColor: colors.border},
  menuIcon: {fontSize: 22, width: 30},
  menuLabel: {flex: 1, fontSize: fontSize.base, color: colors.text},
  menuSub: {fontSize: fontSize.sm, color: colors.textSecondary},
  chevron: {fontSize: 22, color: colors.textMuted},
  signOutBtn: {},
});

export default SettingsScreen;
