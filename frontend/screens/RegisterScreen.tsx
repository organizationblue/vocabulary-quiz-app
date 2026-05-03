import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const { register } = useAuth();

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleRegister = async () => {
        const normalizedUsername = username.trim().toLowerCase();
        const trimmedDisplayName = displayName.trim();

        if (!normalizedUsername || !password) {
            setSnackbarMessage('Username and password are required');
            setSnackbarVisible(true);
            return;
        }

        if (password !== confirmPassword) {
            setSnackbarMessage('Passwords do not match');
            setSnackbarVisible(true);
            return;
        }

        try {
            setSubmitting(true);
            await register(
                normalizedUsername,
                password,
                trimmedDisplayName || undefined
            );
        } catch (error) {
            setSnackbarMessage(
                error instanceof Error ? error.message : 'Failed to register'
            );
            setSnackbarVisible(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
                Create account
            </Text>
            <Text style={styles.subtitle}>
                Register once, then keep your scores tied to your username
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
                label="Display name (optional)"
                value={displayName}
                onChangeText={setDisplayName}
                mode="outlined"
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
            />
            <TextInput
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                disabled={submitting}
                onSubmitEditing={handleRegister}
            />

            <Button
                mode="contained"
                onPress={handleRegister}
                loading={submitting}
                disabled={submitting}
                style={styles.button}
            >
                Register
            </Button>
            <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                disabled={submitting}
            >
                Already have an account? Log in
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
