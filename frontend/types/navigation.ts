export type Language = 'english' | 'swedish' | 'finnish';

export const LANGUAGE_OPTIONS: Array<{ label: string; value: Language }> = [
    { label: 'Finnish', value: 'finnish' },
    { label: 'English', value: 'english' },
    { label: 'Swedish', value: 'swedish' },
];

export interface Word {
    prompt: string;
    answer: string;
}

export type RootStackParamList = {
    Nickname: undefined;
    Game: {
        nickname: string;
        sourceLanguage: Language;
        targetLanguage: Language;
    };
};
