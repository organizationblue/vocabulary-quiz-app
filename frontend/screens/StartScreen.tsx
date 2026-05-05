import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Icon, Menu, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LANGUAGE_OPTIONS, type Language, type RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

export default function StartScreen({ navigation }: Props) {
    const { width } = useWindowDimensions();
    const isCompact = width < 480;
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

    const renderSelector = (
        label: string,
        value: string,
        onPress: () => void
    ) => (
        <Pressable onPress={onPress} style={styles.selectorField}>
            <View style={styles.selectorTextBlock}>
                <Text style={styles.selectorLabel}>{label}</Text>
                <Text style={styles.selectorValue}>{value}</Text>
            </View>
            <Icon source="chevron-down" size={22} color="#666" />
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.card}>
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
                    <View style={styles.selectorGroup}>
                <Menu
                    visible={sourceMenuVisible}
                    onDismiss={() => setSourceMenuVisible(false)}
                    anchor={renderSelector(
                        'From',
                        sourceLanguageLabel,
                        () => setSourceMenuVisible(true)
                    )}
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
                    </View>
                    <View style={styles.directionIcon}>
                        <Icon
                            source={isCompact ? 'arrow-down' : 'arrow-right'}
                            size={24}
                            color="#666"
                        />
                    </View>
                    <View style={styles.selectorGroup}>
                <Menu
                    visible={targetMenuVisible}
                    onDismiss={() => setTargetMenuVisible(false)}
                    anchor={renderSelector(
                        'To',
                        targetLanguageLabel,
                        () => setTargetMenuVisible(true)
                    )}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 18,
        padding: 20,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
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
        gap: 10,
        marginTop: 8,
    },
    selectorGroup: {
        width: '100%',
    },
    selectorField: {
        minHeight: 64,
        borderWidth: 1,
        borderColor: '#d9d9d9',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
    },
    selectorTextBlock: {
        flex: 1,
        paddingRight: 12,
    },
    selectorLabel: {
        color: '#777',
        fontSize: 13,
        marginBottom: 2,
    },
    selectorValue: {
        color: '#111',
        fontSize: 18,
    },
    directionIcon: {
        alignSelf: 'center',
        paddingVertical: 2,
    },
    button: {
        width: '100%',
        marginTop: 4,
    },
});
