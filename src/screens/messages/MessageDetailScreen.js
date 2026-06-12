import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Highlight OTP codes (5-digit numbers) within the message content
const renderContent = (content, type) => {
  if (type !== 'OTP') {
    return <Text style={styles.incomingText}>{content}</Text>;
  }

  const match = content.match(/\d{4,6}/);
  if (!match) {
    return <Text style={styles.incomingText}>{content}</Text>;
  }

  const code = match[0];
  const [before, after] = content.split(code);

  return (
    <Text style={styles.incomingText}>
      {before}
      <Text style={styles.highlight}>{code}</Text>
      {after}
    </Text>
  );
};

const MessageDetailScreen = ({navigation, route}) => {
  const {message} = route.params;

  return (
    <ScreenWrapper title={message.sender} onBack={() => navigation.goBack()}>
      <Text style={styles.dateLabel}>
        {formatDate(message.createdAt)} · {formatTime(message.createdAt)}
      </Text>

      <View style={styles.incomingBubble}>
        {renderContent(message.content, message.type)}
      </View>

      {message.type === 'OTP' && (
        <Text style={styles.footnote}>
          If you didn't request this code, please ignore this message or
          contact support.
        </Text>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  dateLabel: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginVertical: spacing.md,
  },
  incomingBubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderTopLeftRadius: 0,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  incomingText: {fontSize: fontSize.base, color: colors.text, lineHeight: 22},
  highlight: {color: colors.primary, fontWeight: fontWeight.bold},
  footnote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});

export default MessageDetailScreen;