export const mockUser = {
  id: 'user_001',
  name: 'Push Puttichai',
  email: 'push@cabank.com',
  phone: '+84 039 882 9xxx',
};

export const mockCards = [
  {
    id: 'c1',
    holder: 'John Smith',
    brand: 'VISA',
    type: 'Amazon Platinum',
    number: '4756 •••• •••• 9018',
    last4: '9018',
    balance: 3469.52,
    validFrom: '10/15',
    goodThru: '10/20',
    color: 'primary',
  },
  {
    id: 'c2',
    holder: 'John Smith',
    brand: 'VISA',
    type: 'Amazon Platinum',
    number: '4756 •••• •••• 9018',
    last4: '9018',
    balance: 3469.52,
    validFrom: '10/15',
    goodThru: '10/20',
    color: 'gold',
  },
];

export const mockAccounts = [
  {id: 'a1', number: '1900 8988 1234', balance: 20000, branch: 'New York'},
  {id: 'a2', number: '8988 1234', balance: 12000, branch: 'New York'},
  {id: 'a3', number: '1900 1234 2222', balance: 230000, branch: 'New York'},
];

export const mockTransactions = [
  {id: 't1', title: 'Water Bill', cat: 'bill', amount: -280, day: 'Today', status: 'failed', emoji: '💧'},
  {id: 't2', title: 'Income: Salary Oct', cat: 'income', amount: 1200, day: 'Yesterday', status: 'success', emoji: '💼'},
  {id: 't3', title: 'Electric Bill', cat: 'bill', amount: -480, day: 'Yesterday', status: 'success', emoji: '⚡'},
  {id: 't4', title: 'Income: Jane transfers', cat: 'income', amount: 500, day: 'Yesterday', status: 'success', emoji: '👤'},
  {id: 't5', title: 'Internet Bill', cat: 'bill', amount: -100, day: 'Yesterday', status: 'success', emoji: '🌐'},
  {id: 't6', title: 'Buy Camera', cat: 'shopping', amount: -1200, day: '02/10/2019', status: 'success', emoji: '📷'},
  {id: 't7', title: 'Buy Television', cat: 'shopping', amount: -1200, day: '02/10/2019', status: 'success', emoji: '📺'},
];

export const mockBeneficiaries = [
  {id: 'b1', name: 'Emma', number: '0123456789', bank: 'US Bank'},
  {id: 'b2', name: 'Justin', number: '0987654321', bank: 'Citibank'},
  {id: 'b3', name: 'Amanda', number: '0123456788', bank: 'Wells Fargo'},
  {id: 'b4', name: 'Alexander', number: '1278898090', bank: 'JP Morgan'},
];

export const mockExchangeRates = [
  {country: 'Vietnam', flag: '🇻🇳', buy: 1403, sell: 1748},
  {country: 'Nicaragua', flag: '🇳🇮', buy: 9.12, sell: 12.09},
  {country: 'Korea', flag: '🇰🇷', buy: 3704, sell: 5151},
  {country: 'Russia', flag: '🇷🇺', buy: 116.0, sell: 144.4},
  {country: 'China', flag: '🇨🇳', buy: 1725, sell: 2234},
  {country: 'France', flag: '🇫🇷', buy: 23.45, sell: 34.56},
];

export const mockSavings = [
  {id: 's1', account: '1900 8988 5456', from: '02/6/2019', to: '02/6/2020', period: '12 months', rate: 5},
  {id: 's2', account: '1900 8112 5222', from: '02/6/2019', to: '02/6/2020', period: '12 months', rate: 5},
  {id: 's3', account: '4411 0000 1234', from: '02/6/2019', to: '02/6/2020', period: '12 months', rate: 5},
];

export const mockMessages = [
  {id: 'm1', sender: 'Bank of America', preview: '256489 is your authorization code...', time: 'Today', unread: true},
  {id: 'm2', sender: 'Account', preview: 'Your account is limited. Please...', time: '9/10', unread: false},
  {id: 'm3', sender: 'Alert', preview: 'Your statement is ready for you...', time: '9/10', unread: false},
  {id: 'm4', sender: 'Paypal', preview: 'Your account has been locked...', time: '9/9', unread: false},
];

export const mockInterestRates = [
  {customer: 'Individual customers', period: '1m', rate: 4.5},
  {customer: 'Corporate customers', period: '2m', rate: 5.5},
  {customer: 'Individual customers', period: '1m', rate: 4.5},
  {customer: 'Corporate customers', period: '6m', rate: 2.5},
  {customer: 'Individual customers', period: '1m', rate: 4.5},
  {customer: 'Corporate customers', period: '8m', rate: 6.5},
  {customer: 'Individual customers', period: '7m', rate: 4.5},
  {customer: 'Corporate customers', period: '7m', rate: 6.8},
];
