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
}));

vi.mock('react-native-confetti-cannon', () => ({
    default: 'ConfettiCannon',
}));

vi.mock('../../components/Word', () => ({
    default: () => React.createElement('Word'),
}));
