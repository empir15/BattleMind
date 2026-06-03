// ============================================================
// BattleMind Mobile — AppNavigator
// Déclare la pile d'écrans de l'application et sa configuration.
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

// Import de tous les écrans
import SplashScreen from '../screens/splash/SplashScreen';
import HomeScreen from '../screens/home/HomeScreen';
import RoleSelectionScreen from '../screens/role/RoleSelectionScreen';
import CreateRoomScreen from '../screens/room/CreateRoomScreen';
import JoinRoomScreen from '../screens/room/JoinRoomScreen';
import JudgeLobbyScreen from '../screens/lobby/JudgeLobbyScreen';
import TeamLobbyScreen from '../screens/lobby/TeamLobbyScreen';
import MatchScreen from '../screens/match/MatchScreen';
import JudgeControlScreen from '../screens/judge/JudgeControlScreen';
import TournamentBracketScreen from '../screens/tournament/TournamentBracketScreen';
import VictoryScreen from '../screens/victory/VictoryScreen';
import TeamChatScreen from '../screens/chat/TeamChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navigateur principal de l'application BattleMind.
 * Désactive les headers et applique des transitions Cyberpunk douces.
 */
export default function AppNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#0D1117' }, // Correspond à la couleur background du thème
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
      <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
      <Stack.Screen name="JudgeLobby" component={JudgeLobbyScreen} />
      <Stack.Screen name="TeamLobby" component={TeamLobbyScreen} />
      <Stack.Screen name="Match" component={MatchScreen} />
      <Stack.Screen name="JudgeControl" component={JudgeControlScreen} />
      <Stack.Screen name="TournamentBracket" component={TournamentBracketScreen} />
      <Stack.Screen name="Victory" component={VictoryScreen} />
      <Stack.Screen name="TeamChat" component={TeamChatScreen} />
    </Stack.Navigator>
  );
}
