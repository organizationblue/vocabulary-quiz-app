import { useState } from 'react';
import { View, StyleSheet, Button, useWindowDimensions } from 'react-native';
import { Text, TextInput, Snackbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Nickname'>;

export default function NicknameScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const [nickname, setNickname] = useState<string>('');
    const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const handleSubmit = async () => {
        const trimmed = nickname.trim();

        if (trimmed.length === 0) {
            setSnackbarMessage('Please enter a nickname');
            setSnackbarVisible(true);
            return;
        }

        try {
            const response = await fetch (`${API_URL}/api/user`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({ nickname: trimmed}),
            });

            const json = await response.json();
            const isReturning = json.returning;

            await setItem(STORAGE_KEYS.NICKNAME, trimmed);
        
            setSnackbarMessage(
                isReturning
                    ? `Welcome back, ${trimmed}!`
                    : `Welcome, ${trimmed}!`
            );

        } catch (error) {
            // Uses AsyncStorage if API fails
            console.error('Error registering user:', error);
            const existing = await getItem(STORAGE_KEYS.NICKNAME);
            const isReturning = existing === trimmed;
            await setItem(STORAGE_KEYS.NICKNAME, trimmed);

            setSnackbarMessage(
                isReturning
                    ? `Welcome back, ${trimmed}!`
                    : `Welcome, ${trimmed}!`
            );
        }

        setSnackbarVisible(true);

        setTimeout(() => {
            navigation.navigate('Game', { nickname: trimmed });
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
                Vocabulary Quiz
            </Text>
            <Text style={styles.subtitle}>
                Enter your nickname to start
            </Text>
            <TextInput
                label="Nickname"
                value={nickname}
                onChangeText={setNickname}
                mode="outlined"
                style={styles.input}
                maxLength={20}
                autoCapitalize='none'
                onSubmitEditing={handleSubmit}
            />
            <Button
                onPress={handleSubmit}
                title="Start Game"
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8
    },
    subtitle: {
        color: '#666',
        marginBottom: 8
    },
    input: {
        width: '100%',
        maxWidth: 400
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginTop: 8
    }
});