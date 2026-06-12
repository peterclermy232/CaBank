import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {useData} from '../../context/DataContext';
import {messagesApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight} from '../../theme';

const COLORS = ['#3D2ECC', '#E6A817', '#27AE60', '#EB5757'];
const getColor = name => COLORS[(name ?? '?').charCodeAt(0) % COLORS.length];

const formatTime = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)
    return d.toLocaleDateString('en-US', {weekday: 'short'});
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

const MessagesScreen = ({navigation}) => {
  const {messages, refreshMessages, setMessages} = useData();

  // Refresh messages when screen comes into focus
  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  const handleOpen = async item => {
    // Optimistically mark as read in UI
    if (!item.read) {
      setMessages(prev =>
        prev.map(m => (m.id === item.id ? {...m, read: true} : m)),
      );
      try {
        await messagesApi.markRead(item.id);
      } catch (err) {
        console.warn('markRead error:', err.message);
      }
    }
    navigation.navigate('MessageDetail', {message: item});
  };

  return (
    <ScreenWrapper title="Message" scrollable={false} style={{padding: 0}}>
      {messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>✉️</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.messageItem}
              onPress={() => handleOpen(item)}
              activeOpacity={0.8}>
              <View
                style={[
                  styles.avatar,
                  {backgroundColor: getColor(item.sender)},
                ]}>
                <Text style={styles.avatarText}>
                  {(item.sender ?? '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.sender}>{item.sender}</Text>
                  <Text style={styles.time}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.preview}
                </Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold},
  info: {flex: 1, minWidth: 0},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sender: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  time: {fontSize: fontSize.sm, color: colors.textMuted},
  preview: {fontSize: fontSize.sm, color: colors.textSecondary},
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  separator: {height: 1, backgroundColor: colors.border},
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: {fontSize: 52, marginBottom: spacing.md},
  emptyText: {fontSize: fontSize.base, color: colors.textMuted},
});

export default MessagesScreen;