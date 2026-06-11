import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {ScreenWrapper, Avatar, Button} from '../../components/common';
import {mockUser} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../theme';

const MENU_SECTIONS = [
  {
    title: 'Security',
    items: [
      {
        id: 'password',
        label: 'Change password',
        sub: 'Update your account password',
        icon: '🔒',
        screen: 'ChangePassword',
        chevron: true,
      },
      {
        id: 'biometric',
        label: 'Biometric login',
        sub: 'Fingerprint & Face ID settings',
        icon: '👆',
        screen: 'Biometric',
        chevron: true,
      },
      {
        id: 'twofa',
        label: 'Two-factor auth',
        sub: 'Extra layer of sign-in security',
        icon: '🛡️',
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
        icon: '🔔',
        screen: null,
        chevron: true,
      },
      {
        id: 'languages',
        label: 'Language',
        sub: 'English (US)',
        icon: '🌍',
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
        icon: '📞',
        chevron: false,
      },
      {
        id: 'appInfo',
        label: 'App version',
        sub: 'v1.0.0 (Build 42)',
        icon: 'ℹ️',
        chevron: false,
      },
    ],
  },
];

const SettingsScreen = ({navigation}) => {
  const [twofa, setTwofa] = useState(false);

  const handlePress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign out', style: 'destructive', onPress: () => navigation.replace('Auth')},
    ]);
  };

  return (
    <ScreenWrapper title="Settings">
      {/* Profile card */}
      <View style={styles.profileCard}>
        <Avatar name={mockUser.name} size={60} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{mockUser.name}</Text>
          <Text style={styles.profileEmail}>{mockUser.email}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Security badge */}
      <View style={styles.securityBadge}>
        <Text style={styles.securityBadgeIcon}>✅</Text>
        <Text style={styles.securityBadgeText}>Account secured · 2 active sessions</Text>
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
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
                </View>

                {item.toggle ? (
                  <Switch
                    value={twofa}
                    onValueChange={setTwofa}
                    trackColor={{false: colors.border, true: `${colors.primary}80`}}
                    thumbColor={twofa ? colors.primary : '#f4f3f4'}
                  />
                ) : item.chevron ? (
                  <Text style={styles.chevron}>›</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Button
        label="Sign out"
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOutBtn}
      />

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
  editText: {fontSize: fontSize.sm, color: '#fff', fontWeight: fontWeight.semiBold},

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
  securityBadgeIcon: {fontSize: 16},
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
  menuIcon: {fontSize: 18},
  menuTextWrap: {flex: 1},
  menuLabel: {fontSize: fontSize.base, color: colors.text, fontWeight: fontWeight.semiBold},
  menuSub: {fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2},
  chevron: {fontSize: 22, color: colors.textMuted},

  signOutBtn: {marginTop: spacing.sm},
  footerNote: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});

export default SettingsScreen;