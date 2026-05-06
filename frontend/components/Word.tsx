import { useRef, useState } from 'react';
import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    useWindowDimensions,
    Pressable,
} from 'react-native';
import type { Word as WordType } from '../types/navigation';

interface WordProps {
    nickname: string;
    currentWord: WordType;
    wrongAttempts: number;
    score: number;
    currentWordNumber: number;
    sessionSize: number;
    timeLeft: number;
    isTimerCritical: boolean;
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
    timeLeft,
    isTimerCritical,
    onCorrectAnswer,
    onWrongAnswer,
    onSkip,
}: WordProps) {
    const { width } = useWindowDimensions();
    const isCompact = width < 480;
    const titleFontSize = Math.min(width * 0.06, 48);
    const normalFontSize = Math.min(width * 0.04, 20);

    const [guess, setGuess] = useState<string>('');
    const [message, setMessage] = useState<{ content: string; color: 'red' | 'green' }>();
    const inputRef = useRef<TextInput>(null);

    /**
     * Generate hint text based on wrongAttempts from GameScreen
     */
    function generateHint(): string {
        if (!currentWord.answer || wrongAttempts === 0) {
            return '';
        }

        const answer = currentWord.answer;
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
        if (guess.toLowerCase() === currentWord.answer.toLowerCase()) {
            setMessage({ color: 'green', content: 'Your answer is correct!' });
            setGuess('');
            onCorrectAnswer();
        } else {
            // Check if all letters are revealed after this wrong attempt
            if (wrongAttempts + 1 >= currentWord.answer.length) {
                setMessage({
                    color: 'red',
                    content: `Wrong answer. The correct answer is: ${currentWord.answer}`
                });
                setTimeout(() => {
                    setGuess('');
                    setMessage(undefined);
                    onSkip();
                }, 2000);
            } else {
                setMessage({ color: 'red', content: 'Your answer is wrong' });
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
            <Text
                style={[
                    styles.timerText,
                    { fontSize: normalFontSize },
                    isTimerCritical && styles.timerTextDanger,
                ]}
            >
                Time left: {timeLeft}s
            </Text>

            {message && (
                <Text style={[styles.wordText, { fontSize: titleFontSize }, { color: message.color }]}>
                    {message.content}
                </Text>
            )}

            <Text style={[styles.wordText, { fontSize: titleFontSize }]}>
                {currentWord.prompt}
            </Text>

            {hintText && (
                <Text style={[styles.hintText, { fontSize: normalFontSize }]}>
                    Hint: {hintText}
                </Text>
            )}

            <Pressable
                onPress={() => inputRef.current?.focus()}
                style={styles.inputWrapper}
            >
                <TextInput
                    ref={inputRef}
                    placeholder='Type in the translation'
                    style={[styles.input, { fontSize: normalFontSize }]}
                    onChangeText={changeGuess}
                    value={guess}
                    onSubmitEditing={guessWord}
                    returnKeyType="done"
                    blurOnSubmit={false}
                />
            </Pressable>

            <View style={[styles.buttonRow, isCompact && styles.buttonRowCompact]}>
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
        maxWidth: 460,
        padding: 20,
        gap: 14,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 18,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
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
    timerText: {
        color: '#666',
        textAlign: 'center',
        marginTop: -4,
    },
    timerTextDanger: {
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    wordText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputWrapper: {
        width: '100%',
    },
    input: {
        borderColor: 'grey',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 6,
        width: '100%',
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
    buttonRowCompact: {
        justifyContent: 'space-between',
    },
});
