# CaBank — React Native App

A full-featured mobile banking app built with React Native 0.86.

## Project Structure

```
CaBank/
├── src/
│   ├── theme/               # Colors, spacing, typography
│   ├── store/               # Mock data (swap with API later)
│   ├── components/
│   │   ├── common/          # Button, Input, Avatar, ScreenWrapper, TransactionRow
│   │   └── cards/           # BankCard
│   ├── navigation/          # Stack + Bottom Tab (AppNavigator.js)
│   └── screens/
│       ├── auth/            # SignIn, SignUp, ForgotPassword
│       ├── home/            # HomeScreen, TransactionReportScreen
│       ├── transfer/        # TransferScreen (multi-step + OTP)
│       ├── bills/           # BillsScreen (Electric/Water/Mobile/Internet)
│       ├── cards/           # AccountsScreen, CardDetailScreen
│       ├── savings/         # SavingsScreen (Add + Manage)
│       ├── withdraw/        # WithdrawScreen
│       ├── search/          # SearchScreen, ExchangeRateScreen
│       ├── messages/        # MessagesScreen, MessageDetailScreen
│       └── settings/        # SettingsScreen
└── App.tsx
```

## Quick Start

```bash
cd CaBank
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Screens Implemented
- Sign In / Sign Up / Forgot Password
- Home (card carousel, quick actions, transactions)
- Transfer (multi-step with OTP)
- Pay Bills (4 types, multi-step)
- Withdraw, Save Online
- Accounts & Cards, Card Detail
- Transaction Report with bar chart
- Messages + conversation view
- Settings with sign out
- Search, Exchange Rates
