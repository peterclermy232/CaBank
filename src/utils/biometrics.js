import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const rnBiometrics = new ReactNativeBiometrics();
const SERVICE_NAME = 'cabank_biometric_refresh_token';

/**
 * @returns {Promise<'TouchID' | 'FaceID' | 'Biometrics' | null>}
 */
export async function getAvailableBiometryType() {
  try {
    const {available, biometryType} = await rnBiometrics.isSensorAvailable();
    return available ? biometryType : null;
  } catch {
    return null;
  }
}

/**
 * Stores the refresh token behind a biometric gate in the device keystore.
 * @param {string} refreshToken
 */
export async function saveBiometricCredential(refreshToken) {
  if (!refreshToken) throw new Error('Cannot save an empty refresh token');
  await Keychain.setGenericPassword('cabank_user', refreshToken, {
    service: SERVICE_NAME,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Retrieves the stored refresh token — triggers the native biometric prompt.
 * @returns {Promise<string|null>}
 */
export async function getBiometricCredential() {
  try {
    const result = await Keychain.getGenericPassword({service: SERVICE_NAME});
    return result ? result.password : null;
  } catch {
    return null;
  }
}

/**
 * Removes the stored credential — call on sign-out or when biometrics disabled.
 */
export async function clearBiometricCredential() {
  try {
    await Keychain.resetGenericPassword({service: SERVICE_NAME});
  } catch (err) {
    console.warn('Failed to clear biometric credential:', err.message);
  }
}