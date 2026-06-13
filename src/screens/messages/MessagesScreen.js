import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {useData} from '../../context/DataContext';
import {messagesApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const COLORS = ['#3D2ECC', '#E6A817', '#27AE60', '#EB5757'];
const getColor = name => COLORS[(name ?? '?').charCodeAt(0) % COLORS.length];

const formatTime = dateStr => {
  if (!dateStr) return '';
  const d   = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', {weekday: 'short'});
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

// ─── Skeleton placeholder ─────────────────────────────────────────────────────
const MessageSkeleton = () => (
  <View style={styles.messageItem}>
    <View style={[styles.avatar, {backgroundColor: '#E5E7EB'}]} />
    <View style={{flex: 1, gap: 6}}>
      <View style={{height: 13, width: '45%', backgroundColor: '#E5E7EB', borderRadius: 6}} />
      <View style={{height: 11, width: '70%', backgroundColor: '#F3F4F6', borderRadius: 6}} />
    </View>
  </View>
);

const MessagesScreen = ({navigation}) => {
  const {messages, refreshMessages, setMessages, loadingData} = useData();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh when screen mounts
  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // Fix #3: pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMessages();
    setRefreshing(false);
  }, [refreshMessages]);

  const handleOpen = async item => {
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
    <ScreenWrapper title="Messages" scrollable={false} style={{padding: 0}}>
      {loadingData ? (
        <>
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
        </>
      ) : messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>✉️</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>
            Notifications about your activity will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.messageItem,
                !item.read && styles.messageItemUnread,
              ]}
              onPress={() => handleOpen(item)}
              activeOpacity={0.8}>
              <View style={[styles.avatar, {backgroundColor: getColor(item.sender)}]}>
                <Text style={styles.avatarText}>
                  {(item.sender ?? '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.sender}>{item.sender}</Text>
                  <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
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
  messageItemUnread: {
    backgroundColor: `${colors.primary}06`,
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
  sender: {fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text},
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
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {fontSize: 52, marginBottom: spacing.md},
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MessagesScreen;