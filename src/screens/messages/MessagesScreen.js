import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {mockMessages} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const COLORS = ['#3D2ECC', '#E6A817', '#27AE60', '#EB5757'];
const getColor = name => COLORS[name.charCodeAt(0) % COLORS.length];

const MessagesScreen = ({navigation}) => {
  return (
    <ScreenWrapper title="Message" scrollable={false} style={{padding: 0}}>
      <FlatList
        data={mockMessages}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.messageItem}
            onPress={() => navigation.navigate('MessageDetail', {message: item})}
            activeOpacity={0.8}>
            <View style={[styles.avatar, {backgroundColor: getColor(item.sender)}]}>
              <Text style={styles.avatarText}>{item.sender[0]}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={styles.sender}>{item.sender}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>{item.preview}</Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  messageItem: {flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, gap: spacing.md},
  avatar: {width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold},
  info: {flex: 1, minWidth: 0},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  sender: {fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text},
  time: {fontSize: fontSize.sm, color: colors.textMuted},
  preview: {fontSize: fontSize.sm, color: colors.textSecondary},
  unreadDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary},
  separator: {height: 1, backgroundColor: colors.border},
});

export default MessagesScreen;
