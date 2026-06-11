import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {ScreenWrapper, Button} from '../../components/common';
import {mockUser} from '../../store/data';
import {colors, spacing, fontSize, fontWeight, borderRadius} from '../../theme';

const EditProfileScreen = ({navigation}) => {
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [phone, setPhone] = useState(mockUser.phone || '');

  const handleSave = () => {
    mockUser.name = name;
    mockUser.email = email;
    mockUser.phone = phone;
    Alert.alert('Success', 'Profile updated successfully', [
      {text: 'OK', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <ScreenWrapper title="Edit Profile">
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </View>
      <Button label="Save Changes" onPress={handleSave} style={{marginTop: spacing.xl}} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  field: {marginBottom: spacing.lg},
  label: {fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.textMuted, marginBottom: spacing.xs},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
  },
});

export default EditProfileScreen;
