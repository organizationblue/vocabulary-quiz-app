import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Icon, Menu, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LANGUAGE_OPTIONS, type Language, type RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

export default function StartScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const normalFontSize = Math.min(width * 0.04, 20);
    const { user, logout } = useAuth();

    const [sourceLanguage, setSourceLanguage] = useState<Language>('finnish');
    const [targetLanguage, setTargetLanguage] = useState<Language>('english');
    const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
    const [targetMenuVisible, setTargetMenuVisible] = useState(false);

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

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
                Vocabulary Quiz
            </Text>
            <Text style={[styles.subtitle, { fontSize: normalFontSize }]}>
                Logged in as {user?.displayName ?? user?.username}
            </Text>
            {user?.displayName && user.displayName !== user.username ? (
                <Text style={styles.helperText}>@{user.username}</Text>
            ) : null}
            <Text style={styles.helperText}>
                Choose the translation direction for this session
            </Text>

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
                mode="contained"
                style={styles.button}
                onPress={() => {
                    if (!user) {
                        return;
                    }

                    navigation.navigate('Game', {
                        displayName: user.displayName,
                        sourceLanguage,
                        targetLanguage,
                    });
                }}
            >
                Start Game
            </Button>
            <Button mode="outlined" style={styles.button} onPress={logout}>
                Log Out
            </Button>
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
        gap: 12,
    },
    title: {
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#333',
        textAlign: 'center',
    },
    helperText: {
        color: '#666',
        textAlign: 'center',
    },
    languageContainer: {
        width: '100%',
        maxWidth: 420,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    dropdownButton: {
        flex: 1,
    },
    dropdownButtonContent: {
        minHeight: 48,
    },
    button: {
        width: '100%',
        maxWidth: 420,
        marginTop: 4,
    },
});
