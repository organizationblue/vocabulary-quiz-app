import React from 'react';
import { vi } from 'vitest';

vi.mock('react-native', () => ({
    View: 'View',
    Text: 'Text',
    Button: 'Button',
    TextInput: 'TextInput',
    StyleSheet: {
        create: (styles: unknown) => styles,
    },
    useWindowDimensions: () => ({ width: 400, height: 800 }),
}));

vi.mock('react-native-paper', () => ({
    Text: 'Text',
    Button: 'Button',
    Snackbar: 'Snackbar',
    TextInput: 'TextInput',
    Menu: 'Menu',
    Icon: 'Icon',
    ActivityIndicator: 'ActivityIndicator',
    PaperProvider: ({ children }: { children: React.ReactNode }) => children,
    MD3LightTheme: {},
}));

vi.mock('react-native-confetti-cannon', () => ({
    default: 'ConfettiCannon',
}));

vi.mock('expo-secure-store', () => ({
    getItemAsync: vi.fn().mockResolvedValue(null),
    setItemAsync: vi.fn().mockResolvedValue(undefined),
    deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../components/Word', () => ({
    default: () => React.createElement('Word'),
}));
