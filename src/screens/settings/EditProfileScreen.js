import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {ScreenWrapper, Button, Input} from '../../components/common';
import {useAuth} from '../../context/AuthContext';
import {authApi} from '../../api/services';
import {colors, spacing, fontSize, fontWeight} from '../../theme';

const EditProfileScreen = ({navigation}) => {
  const {user, refreshUser} = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await authApi.updateProfile({
        name: name !== user?.name ? name : undefined,
        phone: phone !== user?.phone ? phone : undefined,
      });
      await refreshUser(); // Update AuthContext with latest profile
      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err) {
      Alert.alert('Update failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      title="Edit Profile"
      onBack={() => navigation.goBack()}>
      <View style={styles.field}>
        <Input
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.field}>
        <Input
          label="Email"
          placeholder="Email address"
          value={user?.email ?? ''}
          onChangeText={() => {}}
          editable={false}
        />
        <Text style={styles.hint}>Email cannot be changed.</Text>
      </View>
      <View style={styles.field}>
        <Input
          label="Phone"
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
      <Button
        label={loading ? 'Saving…' : 'Save Changes'}
        onPress={handleSave}
        disabled={loading || (!name && !phone)}
        loading={loading}
        style={{marginTop: spacing.xl}}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  field: {marginBottom: spacing.sm},
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    paddingHorizontal: 2,
  },
});

export default EditProfileScreen;