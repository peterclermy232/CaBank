import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {DataProvider} from './src/context/DataContext';
import {ToastProvider} from './src/components/common';

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;