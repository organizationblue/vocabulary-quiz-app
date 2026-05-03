export type Language = 'english' | 'swedish' | 'finnish' | 'german' | 'spanish';

export const LANGUAGE_OPTIONS: Array<{ label: string; value: Language }> = [
    { label: 'Finnish', value: 'finnish' },
    { label: 'English', value: 'english' },
    { label: 'Swedish', value: 'swedish' },
    { label: 'German', value: 'german' },
    { label: 'Spanish', value: 'spanish' },
];

export interface Word {
    prompt: string;
    answer: string;
}

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Start: undefined;
    Game: {
        displayName: string;
        scoreIdentity: string;
        sourceLanguage: Language;
        targetLanguage: Language;
    };
};
