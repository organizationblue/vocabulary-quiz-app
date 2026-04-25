import { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, TextInput, Snackbar, Menu, Button, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Language, LANGUAGE_OPTIONS } from '../types/navigation';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Nickname'>;

export default function NicknameScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const [nickname, setNickname] = useState<string>('');
    const [sourceLanguage, setSourceLanguage] = useState<Language>('finnish');
    const [targetLanguage, setTargetLanguage] = useState<Language>('english');
    const [sourceMenuVisible, setSourceMenuVisible] = useState<boolean>(false);
    const [targetMenuVisible, setTargetMenuVisible] = useState<boolean>(false);
    const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const sourceLanguageLabel =
        LANGUAGE_OPTIONS.find(option => option.value === sourceLanguage)?.label ?? sourceLanguage;
    const targetLanguageLabel =
        LANGUAGE_OPTIONS.find(option => option.value === targetLanguage)?.label ?? targetLanguage;
    const availableSourceLanguages = LANGUAGE_OPTIONS.filter(
        option => option.value !== targetLanguage
    );
    const availableTargetLanguages = LANGUAGE_OPTIONS.filter(
        option => option.value !== sourceLanguage
    );

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
            navigation.navigate('Game', {
                nickname: trimmed,
                sourceLanguage,
                targetLanguage,
            });
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
                Vocabulary Quiz
            </Text>
            <Text style={styles.subtitle}>
                Enter your nickname and choose the quiz languages
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
            <View style={styles.languageContainer}>
                <Menu
                    visible={sourceMenuVisible}
                    onDismiss={() => setSourceMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setSourceMenuVisible(true)}
                            style={styles.dropdownButton}
                            contentStyle={styles.dropdownButtonContent}
                        >
                            {sourceLanguageLabel}
                        </Button>
                    }
                >
                    {availableSourceLanguages.map(option => (
                        <Menu.Item
                            key={option.value}
                            onPress={() => {
                                setSourceLanguage(option.value);
                                setSourceMenuVisible(false);
                            }}
                            title={option.label}
                        />
                    ))}
                </Menu>
                <Icon source="arrow-right" size={24} color="#666" />
                <Menu
                    visible={targetMenuVisible}
                    onDismiss={() => setTargetMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setTargetMenuVisible(true)}
                            style={styles.dropdownButton}
                            contentStyle={styles.dropdownButtonContent}
                        >
                            {targetLanguageLabel}
                        </Button>
                    }
                >
                    {availableTargetLanguages.map(option => (
                        <Menu.Item
                            key={option.value}
                            onPress={() => {
                                setTargetLanguage(option.value);
                                setTargetMenuVisible(false);
                            }}
                            title={option.label}
                        />
                    ))}
                </Menu>
            </View>
            <Button
                onPress={handleSubmit}
                mode="contained"
                style={styles.button}
            >
                Start Game
            </Button>
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
    languageContainer: {
        width: '100%',
        maxWidth: 400,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    dropdownButton: {
        flex: 1
    },
    dropdownButtonContent: {
        minHeight: 48
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginTop: 8
    }
});
