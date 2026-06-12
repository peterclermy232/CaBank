/**
 * DataContext
 *
 * App-wide cache for shared data so every screen doesn't independently
 * hit the backend on mount. Refreshed on demand via refresh().
 *
 * Provides:
 *   cards, accounts, transactions, messages, exchangeRates, beneficiaries
 *   loadingData  – true on first load
 *   refresh()    – force reload everything
 *   refreshMessages() – lightweight re-fetch of messages only
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  cardsApi,
  accountsApi,
  transactionsApi,
  messagesApi,
  exchangeRatesApi,
  beneficiariesApi,
} from '../api/services';
import {useAuth} from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({children}) {
  const {user} = useAuth();

  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      // Exchange rates are public — always fetch
      const [rates, ...authResults] = await Promise.allSettled([
        exchangeRatesApi.list(),
        cardsApi.list(),
        accountsApi.list(),
        transactionsApi.recent(),
        messagesApi.list(),
        beneficiariesApi.list(),
      ]);

      if (rates.status === 'fulfilled') setExchangeRates(rates.value ?? []);

      const [cds, accs, txs, msgs, bens] = authResults;
      if (cds.status === 'fulfilled')  setCards(cds.value ?? []);
      if (accs.status === 'fulfilled') setAccounts(accs.value ?? []);
      if (txs.status === 'fulfilled')  setTransactions(txs.value ?? []);
      if (msgs.status === 'fulfilled') setMessages(msgs.value ?? []);
      if (bens.status === 'fulfilled') setBeneficiaries(bens.value ?? []);
    } catch (err) {
      console.warn('DataContext fetchAll error:', err.message);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const refreshMessages = useCallback(async () => {
    try {
      const msgs = await messagesApi.list();
      setMessages(msgs ?? []);
    } catch (err) {
      console.warn('refreshMessages error:', err.message);
    }
  }, []);

  // Re-fetch whenever the user logs in/out
  useEffect(() => {
    if (user) {
      setLoadingData(true);
      fetchAll();
    } else {
      // Clear cached data on sign-out
      setCards([]);
      setAccounts([]);
      setTransactions([]);
      setMessages([]);
      setBeneficiaries([]);
      setLoadingData(false);
    }
  }, [user, fetchAll]);

  return (
    <DataContext.Provider
      value={{
        cards,
        accounts,
        transactions,
        messages,
        exchangeRates,
        beneficiaries,
        loadingData,
        refresh: fetchAll,
        refreshMessages,
        // Setters exposed so individual screens can optimistically update
        setCards,
        setMessages,
        setBeneficiaries,
      }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}