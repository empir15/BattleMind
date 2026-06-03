// ============================================================
// BattleMind Mobile — Point d'entrée App.tsx
// Configure la navigation et initialise les providers.
// ============================================================

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { navigationRef } from './src/navigation/navigationRef';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/theme';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
