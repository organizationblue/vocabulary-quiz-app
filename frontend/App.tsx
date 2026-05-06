import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameScreen from './screens/GameScreen';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import StartScreen from './screens/StartScreen';
import ScoreboardScreen from './screens/ScoreboardScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator animating size="large" />
                <Text style={styles.loadingText}>Restoring session...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator id={undefined}>
                {user ? (
                    <>
                        <Stack.Screen
                            name="Start"
                            component={StartScreen}
                            options={{ title: 'Vocabulary Quiz' }}
                        />
                        <Stack.Screen
                            name="Game"
                            component={GameScreen}
                            options={{ title: 'Vocabulary Quiz' }}
                        />
                        <Stack.Screen
                            name="Scoreboard"
                            component={ScoreboardScreen}
                            options={{ title: 'Scoreboard' }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ title: 'Log In' }}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ title: 'Register' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <PaperProvider theme={MD3LightTheme}>
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#666',
    },
});
