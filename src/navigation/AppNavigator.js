import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';

// Auth screens
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import TransactionReportScreen from '../screens/home/TransactionReportScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ExchangeRateScreen from '../screens/search/ExchangeRateScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import MessageDetailScreen from '../screens/messages/MessageDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import BiometricScreen from '../screens/settings/BiometricScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';

// Feature screens
import TransferScreen from '../screens/transfer/TransferScreen';
import BillsScreen from '../screens/bills/BillsScreen';
import WithdrawScreen from '../screens/withdraw/WithdrawScreen';
import SavingsScreen from '../screens/savings/SavingsScreen';
import AccountsScreen from '../screens/cards/AccountsScreen';
import CardDetailScreen from '../screens/cards/CardDetailScreen';

import {colors, fontSize, fontWeight} from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Search: '🔍',
  Messages: '✉️',
  Settings: '⚙️',
};

const TabIcon = ({name, focused}) => (
  <View style={{alignItems: 'center'}}>
    <Text style={{fontSize: 22}}>{TAB_ICONS[name]}</Text>
    {focused && (
      <View style={{width: 20, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 2}} />
    )}
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarLabelStyle: {fontSize: fontSize.xs, fontWeight: fontWeight.semiBold},
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {borderTopColor: colors.border, height: 62, paddingBottom: 8},
      tabBarIcon: ({focused}) => <TabIcon name={route.name} focused={focused} />,
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Auth">
      {/* Auth Stack */}
      <Stack.Screen name="Auth" component={SignInScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Main App */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Feature screens */}
      <Stack.Screen name="Transfer" component={TransferScreen} />
      <Stack.Screen name="Bills" component={BillsScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="Savings" component={SavingsScreen} />
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="TransactionReport" component={TransactionReportScreen} />
      <Stack.Screen name="ExchangeRate" component={ExchangeRateScreen} />
      <Stack.Screen name="MessageDetail" component={MessageDetailScreen} />

      {/* Settings sub-screens */}
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Biometric" component={BiometricScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      {/* Placeholder screens */}
      <Stack.Screen name="Prepaid" component={WithdrawScreen} />
      <Stack.Screen name="CreditCard" component={BillsScreen} />
      <Stack.Screen name="Beneficiary" component={AccountsScreen} />
      <Stack.Screen name="Exchange" component={ExchangeRateScreen} />
      <Stack.Screen name="Branch" component={SearchScreen} />
      <Stack.Screen name="InterestRate" component={ExchangeRateScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;