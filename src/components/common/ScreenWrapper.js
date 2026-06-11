import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import {colors, spacing, fontSize, fontWeight} from '../../theme';

const ScreenWrapper = ({
  children,
  title,
  onBack,
  scrollable = true,
  headerColor = colors.surface,
  style,
}) => {
  const Content = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: headerColor}]}>
      <StatusBar
        barStyle={headerColor === colors.primary ? 'light-content' : 'dark-content'}
        backgroundColor={headerColor}
      />
      {title && (
        <View style={[styles.header, {backgroundColor: headerColor}]}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={[styles.backIcon, headerColor === colors.primary && styles.backIconLight]}>
                ‹
              </Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.title, headerColor === colors.primary && styles.titleLight]}>
            {title}
          </Text>
        </View>
      )}
      <Content
        style={[styles.content, style]}
        contentContainerStyle={scrollable && styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {children}
      </Content>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: 4,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
    lineHeight: 28,
  },
  backIconLight: {
    color: colors.textInverse,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  titleLight: {
    color: colors.textInverse,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default ScreenWrapper;
