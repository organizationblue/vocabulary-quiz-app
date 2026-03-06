import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameScreen from './screens/GameScreen';
import NicknameScreen from './screens/NicknameScreen';
import { StyleSheet, Text, View } from 'react-native';
import Word from './components/Word';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider theme={MD3LightTheme}>
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator id={undefined} initialRouteName="Nickname">
        <Stack.Screen
        name='Nickname'
        component={NicknameScreen}
        options={{title: 'Vocabulary Quiz '}}
        />
        <Stack.Screen
        name='Game'
        component={GameScreen}
        options={{title: 'Vocabulary Quiz' }}
        />
      </Stack.Navigator>
    </NavigationContainer>  
    </PaperProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
