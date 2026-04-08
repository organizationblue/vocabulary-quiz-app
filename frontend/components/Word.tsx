import { useEffect, useRef, useState } from 'react';
import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    useWindowDimensions
} from 'react-native';
import type { Word as WordType } from '../types/navigation';

interface WordProps {
    nickname: string;
    currentWord: WordType;
    wrongAttempts: number;
    score: number;
    currentWordNumber: number;
    sessionSize: number;
    onCorrectAnswer: () => void;
    onWrongAnswer: () => void;
    onSkip: () => void;
}

export default function Word({
    nickname,
    currentWord,
    wrongAttempts,
    score,
    currentWordNumber,
    sessionSize,
    onCorrectAnswer,
    onWrongAnswer,
    onSkip,
}: WordProps) {
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const normalFontSize = Math.min(width * 0.04, 20);

    const [guess, setGuess] = useState<string>('');
    const [message, setMessage] = useState<{ content: string; color: 'red' | 'green' }>();
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [currentWord]);

    /**
     * Generate hint text based on wrongAttempts from GameScreen
     */
    function generateHint(): string {
        if (!currentWord.english || wrongAttempts === 0) {
            return '';
        }

        const answer = currentWord.english;
        let hint = '';

        for (let i = 0; i < answer.length; i++) {
            if (i < wrongAttempts) {
                hint += answer[i];
            } else {
                hint += '_';
            }
            if (i < answer.length - 1) {
                hint += ' ';
            }
        }
        return hint;
    }

    /**
     * Check if the guess is correct
     */
    function guessWord() {
        if (guess.toLowerCase() === currentWord.english.toLowerCase()) {
            setMessage({ color: 'green', content: 'Your answer is correct!' });
            setGuess('');
            onCorrectAnswer();
        } else {
            // Check if all letters are revealed after this wrong attempt
            if (wrongAttempts + 1 >= currentWord.english.length) {
                setMessage({
                    color: 'red',
                    content: `Wrong answer. The correct answer is: ${currentWord.english}`
                });
                setTimeout(() => {
                    setGuess('');
                    setMessage(undefined);
                    onSkip();
                }, 2000);
            } else {
                setMessage({ color: 'red', content: 'Your answer is wrong' });
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            onWrongAnswer();
        }
    }

    function handleSkip() {
        setGuess('');
        setMessage(undefined);
        onSkip();
    }

    function changeGuess(newGuess: string) {
        setMessage(undefined);
        setGuess(newGuess);
    }

    const hintText = generateHint();

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.nicknameText, { fontSize: normalFontSize }]}>
                    {nickname}
                </Text>
                <Text style={[styles.scoreText, { fontSize: normalFontSize }]}>
                    {score} / {sessionSize}
                </Text>
            </View>

            <Text style={[styles.progressText, { fontSize: normalFontSize }]}>
                Word {currentWordNumber} / {sessionSize}
            </Text>

            {message && (
                <Text style={[styles.wordText, { fontSize: titleFontSize }, { color: message.color }]}>
                    {message.content}
                </Text>
            )}

            <Text style={[styles.wordText, { fontSize: titleFontSize }]}>
                {currentWord.finnish}
            </Text>

            {hintText && (
                <Text style={[styles.hintText, { fontSize: normalFontSize }]}>
                    Hint: {hintText}
                </Text>
            )}

            <TextInput
                ref={inputRef}
                placeholder='Type in the translation'
                style={[styles.input, { fontSize: normalFontSize }]}
                onChangeText={changeGuess}
                value={guess}
                onSubmitEditing={guessWord}
                autoFocus
            />

            <View style={styles.buttonRow}>
                <Button
                    onPress={guessWord}
                    title="Submit"
                />
                <Button
                    onPress={handleSkip}
                    title="Skip"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 20,
        gap: 12
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    nicknameText: {
        color: '#666',
    },
    scoreText: {
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    progressText: {
        color: '#999',
        textAlign: 'center',
    },
    wordText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
    },
    hintText: {
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
});