import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleLogin = async () => {
        const normalizedUsername = username.trim().toLowerCase();

        if (!normalizedUsername || !password) {
            setSnackbarMessage('Please enter both username and password');
            setSnackbarVisible(true);
            return;
        }

        try {
            setSubmitting(true);
            await login(normalizedUsername, password);
        } catch (error) {
            setSnackbarMessage(
                error instanceof Error ? error.message : 'Failed to log in'
            );
            setSnackbarVisible(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
                Welcome back
            </Text>
            <Text style={styles.subtitle}>
                Log in to continue your language-specific quiz progress
            </Text>

            <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                disabled={submitting}
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                disabled={submitting}
                onSubmitEditing={handleLogin}
            />

            <Button
                mode="contained"
                onPress={handleLogin}
                loading={submitting}
                disabled={submitting}
                style={styles.button}
            >
                Log In
            </Button>
            <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                disabled={submitting}
            >
                Need an account? Register
            </Button>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2500}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 12,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
        maxWidth: 420,
    },
    input: {
        width: '100%',
        maxWidth: 400,
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginTop: 8,
    },
});
