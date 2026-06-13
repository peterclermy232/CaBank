import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScreenWrapper, Avatar, Button} from '../../components/common';
import {useAuth} from '../../context/AuthContext';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const MENU_SECTIONS = [
  {
    title: 'Security',
    items: [
      {
        id: 'password',
        label: 'Change password',
        sub: 'Update your account password',
        icon: 'lock-outline',
        screen: 'ChangePassword',
        chevron: true,
      },
      {
        id: 'biometric',
        label: 'Biometric login',
        sub: 'Fingerprint & Face ID settings',
        icon: 'fingerprint',
        screen: 'Biometric',
        chevron: true,
      },
      {
        id: 'twofa',
        label: 'Two-factor auth',
        sub: 'Extra layer of sign-in security',
        icon: 'shield-check-outline',
        toggle: true,
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        sub: 'Push and email alerts',
        icon: 'bell-outline',
        screen: null,
        chevron: true,
      },
      {
        id: 'languages',
        label: 'Language',
        sub: 'English (US)',
        icon: 'earth',
        screen: null,
        chevron: true,
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'care',
        label: 'Customer care',
        sub: '1800 8981',
        icon: 'phone-outline',
        chevron: false,
      },
      {
        id: 'appInfo',
        label: 'App version',
        sub: 'v1.0.0 (Build 42)',
        icon: 'information-outline',
        chevron: false,
      },
    ],
  },
];

const SettingsScreen = ({navigation}) => {
  const {user, signOut} = useAuth();
  const [twofa, setTwofa] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handlePress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigation.replace('Auth');
    } catch (e) {
      console.warn('Sign out error:', e);
      navigation.replace('Auth');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScreenWrapper title="Settings">
      {/* Profile card */}
      <View style={styles.profileCard}>
        <Avatar name={user?.name ?? ''} size={60} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? ''}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Security badge */}
      <View style={styles.securityBadge}>
        <Icon name="check-circle" size={16} color={colors.success} />
        <Text style={styles.securityBadgeText}>
          Account secured · 2 active sessions
        </Text>
      </View>

      {/* Menu sections */}
      {MENU_SECTIONS.map(section => (
        <View key={section.title} style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  idx < section.items.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={item.screen || item.toggle ? 0.7 : 1}
                onPress={() => !item.toggle && handlePress(item)}>
                <View style={styles.menuIconWrap}>
                  <Icon name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.sub ? (
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  ) : null}
                </View>
                {item.toggle ? (
                  <Switch
                    value={twofa}
                    onValueChange={setTwofa}
                    trackColor={{false: colors.border, true: `${colors.primary}80`}}
                    thumbColor={twofa ? colors.primary : '#f4f3f4'}
                  />
                ) : item.chevron ? (
                  <Icon name="chevron-right" size={22} color={colors.textMuted} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign out — inline confirmation instead of Alert */}
      {showSignOutConfirm ? (
        <View style={styles.confirmBox}>
          <Icon name="logout" size={20} color={colors.error} />
          <Text style={styles.confirmText}>
            Are you sure you want to sign out?
          </Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={styles.confirmCancel}
              onPress={() => setShowSignOutConfirm(false)}
              disabled={signingOut}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmSignOut, signingOut && {opacity: 0.7}]}
              onPress={handleSignOut}
              disabled={signingOut}>
              <Text style={styles.confirmSignOutText}>
                {signingOut ? 'Signing out…' : 'Sign out'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Button
          label="Sign out"
          variant="outline"
          onPress={() => setShowSignOutConfirm(true)}
          style={styles.signOutBtn}
        />
      )}

      <Text style={styles.footerNote}>CaBank · Secure Banking v1.0.0</Text>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  profileInfo: {flex: 1},
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extraBold,
    color: '#fff',
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  editText: {
    fontSize: fontSize.sm,
    color: '#fff',
    fontWeight: fontWeight.semiBold,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}12`,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  securityBadgeText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.semiBold,
  },
  sectionWrapper: {marginBottom: spacing.lg},
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 60,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {flex: 1},
  menuLabel: {
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: fontWeight.semiBold,
  },
  menuSub: {fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2},
  signOutBtn: {marginTop: spacing.sm},

  // Inline sign-out confirmation
  confirmBox: {
    backgroundColor: `${colors.error}10`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },
  confirmText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semiBold,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    width: '100%',
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  confirmCancelText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semiBold,
  },
  confirmSignOut: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  confirmSignOutText: {
    fontSize: fontSize.sm,
    color: '#fff',
    fontWeight: fontWeight.semiBold,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});

export default SettingsScreen;