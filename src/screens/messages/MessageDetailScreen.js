import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform} from 'react-native';
import {ScreenWrapper} from '../../components/common';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const MessageDetailScreen = ({navigation, route}) => {
  const {message} = route.params;
  const [text, setText] = useState('');

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenWrapper title={message.sender} onBack={() => navigation.goBack()}>
        {/* Incoming */}
        <Text style={styles.dateLabel}>8/10/2018</Text>
        <View style={styles.incomingBubble}>
          <Text style={styles.incomingText}>
            Did you attempt transaction on debit card ending in 0000 at Merchant in NJ for $1,200? Reply YES or NO
          </Text>
        </View>

        {/* Outgoing */}
        <View style={styles.outgoingRow}>
          <View style={styles.outgoingBubble}><Text style={styles.outgoingText}>Yes</Text></View>
        </View>

        <Text style={styles.dateLabel}>6/10/2019</Text>
        <View style={styles.incomingBubble}>
          <Text style={styles.incomingText}>
            <Text style={styles.highlight}>Bank of America: 256489</Text> is your authorization code which expires in 10 minutes. If you didn't request the code, Call: 18009898 for assistance
          </Text>
        </View>
      </ScreenWrapper>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Type something..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  dateLabel: {textAlign: 'center', fontSize: fontSize.xs, color: colors.textMuted, marginVertical: spacing.md},
  incomingBubble: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderTopLeftRadius: 0, padding: spacing.md, marginBottom: spacing.sm, maxWidth: '80%', borderWidth: 1, borderColor: colors.border},
  incomingText: {fontSize: fontSize.base, color: colors.text, lineHeight: 22},
  highlight: {color: colors.primary, fontWeight: fontWeight.bold},
  outgoingRow: {alignItems: 'flex-end', marginBottom: spacing.sm},
  outgoingBubble: {backgroundColor: colors.primary, borderRadius: borderRadius.lg, borderTopRightRadius: 0, padding: spacing.md},
  outgoingText: {fontSize: fontSize.base, color: '#fff', fontWeight: fontWeight.semiBold},
  inputBar: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm},
  textInput: {flex: 1, backgroundColor: '#F9FAFB', borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: fontSize.base, color: colors.text},
  sendBtn: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
  sendIcon: {color: '#fff', fontSize: 16},
});

export default MessageDetailScreen;
