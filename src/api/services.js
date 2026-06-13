/**
 * CaBank API Services
 * One function per backend endpoint, typed with JSDoc for IDE hints.
 */

import api from './client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  /**
   * @param {{ name: string, email: string, password: string, phone?: string }} body
   * @returns {{ accessToken, refreshToken, tokenType, user }}
   */
  signUp: body => api.post('/auth/signup', body, {skipAuth: true}),

  /**
   * @param {{ email: string, password: string }} body
   * @returns {{ accessToken, refreshToken, tokenType, user }}
   */
  signIn: body => api.post('/auth/signin', body, {skipAuth: true}),

  /**
   * @param {string} refreshToken
   * @returns {{ accessToken, refreshToken, tokenType, user }}
   */
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', {refreshToken}, {skipAuth: true}),

  /** @returns {{ id, name, email, phone, role, createdAt }} */
  getMe: () => api.get('/auth/me'),

  /**
   * @param {{ name?: string, phone?: string }} body
   */
  updateProfile: body => api.put('/auth/me', body),

  /**
   * @param {{ currentPassword: string, newPassword: string }} body
   */
  changePassword: body => api.post('/auth/change-password', body),

  /**
   * @param {string} phone
   */
  forgotPassword: (phone) =>
    api.post('/auth/forgot-password', {phone}, {skipAuth: true}),

  /**
   * @param {string} phone
   * @param {string} code
   */
  verifyOtp: (phone, code) =>
    api.post('/auth/verify-otp', {phone, code}, {skipAuth: true}),

  resetPassword: (phone, newPassword, confirmPassword) =>
    api.post('/auth/reset-password', {phone, newPassword, confirmPassword}, {skipAuth: true}),
};

// ─── Accounts ─────────────────────────────────────────────────────────────────
export const accountsApi = {
  /** @returns {{ id, accountNumber, balance, branch, type, active }[]} */
  list: () => api.get('/accounts'),

  /** @param {string} id */
  get: id => api.get(`/accounts/${id}`),

  /**
   * @param {{ branch: string, type: string, initialDeposit?: number }} body
   * @returns {{ id, accountNumber, balance, branch, type, active }}
   */
  create: body => api.post('/accounts', body),
};

// ─── Cards ────────────────────────────────────────────────────────────────────
export const cardsApi = {
  /** @returns {{ id, last4, holderName, brand, cardType, balance, validFrom, goodThru, color, active }[]} */
  list: () => api.get('/cards'),

  /** @param {string} id */
  get: id => api.get(`/cards/${id}`),

  /**
   * @param {{ holderName, brand, cardType, validFrom, goodThru }} body
   */
  add: body => api.post('/cards', body),

  /** @param {string} id */
  delete: id => api.delete(`/cards/${id}`),
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionsApi = {
  /**
   * @param {{ page?: number, size?: number }} params
   * @returns {{ content: Transaction[], totalPages, totalElements, ... }}
   */
  list: ({page = 0, size = 20} = {}) =>
    api.get(`/transactions?page=${page}&size=${size}`),

  /** @returns {Transaction[]} Last 10 transactions */
  recent: () => api.get('/transactions/recent'),
};

// ─── Transfers ────────────────────────────────────────────────────────────────
export const transfersApi = {
  /**
   * @param {{ fromCardLast4, toAccountNumber, beneficiaryName, amount, note? }} body
   */
  create: body => api.post('/transfers', body),

  /** @returns {Transfer[]} */
  list: () => api.get('/transfers'),
};

// ─── Bills ────────────────────────────────────────────────────────────────────
export const billsApi = {
  /**
   * @param {{ billType, billCode, customerName, customerAddress, amount }} body
   */
  pay: body => api.post('/bills/pay', body),

  /** @returns {BillPayment[]} */
  history: () => api.get('/bills/history'),
};

// ─── Savings ─────────────────────────────────────────────────────────────────
export const savingsApi = {
  /**
   * @param {{ accountNumber, amount, period, fromDate, toDate, interestRate }} body
   */
  create: body => api.post('/savings', body),

  /** @returns {Savings[]} */
  list: () => api.get('/savings'),
};

// ─── Messages ────────────────────────────────────────────────────────────────
export const messagesApi = {
  /** @returns {Message[]} */
  list: () => api.get('/messages'),

  /** @param {string} id */
  markRead: id => api.patch(`/messages/${id}/read`),

  /** @returns {number} */
  unreadCount: () => api.get('/messages/unread-count'),
};

// ─── Exchange Rates ───────────────────────────────────────────────────────────
export const exchangeRatesApi = {
  /**
   * @returns {{ id, country, currencyCode, flag, buyRate, sellRate, updatedAt }[]}
   */
  list: () => api.get('/exchange-rates', {skipAuth: true}),
};

// ─── Beneficiaries ────────────────────────────────────────────────────────────
export const beneficiariesApi = {
  /** @returns {{ id, name, accountNumber, bankName }[]} */
  list: () => api.get('/beneficiaries'),

  /** @param {{ name, accountNumber, bankName }} body */
  add: body => api.post('/beneficiaries', body),

  /** @param {string} id */
  delete: id => api.delete(`/beneficiaries/${id}`),
};

export const otpApi = {
  request: () => api.post('/otp/request', {}),
  verify: (code) => api.post('/otp/verify', {code}),
};

// ─── Deposits ────────────────────────────────────────────────────────────────
export const depositsApi = {
  /**
   * @param {{ accountNumber: string, amount: number, note?: string, otpCode: string }} body
   */
  create: body => api.post('/deposits', body),
};

export const topUpApi = {
  /**
   * @param {{ cardId: string, amount: number }} data
   */
  topUp: (data) => api.post('/topup', data),
};

// ─── Withdrawals ──────────────────────────────────────────────────────────────
export const withdrawalsApi = {
  /**
   * @param {{ cardId: string, phone: string, amount: number, otpCode: string }} body
   * @returns {{ id, amount, cardLast4, phone, status, newBalance, createdAt }}
   */
  create: body => api.post('/withdraw', body),

  /** @returns {Withdrawal[]} */
  history: () => api.get('/withdraw'),
};