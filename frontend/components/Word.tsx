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

            <View style={styles.wordArea}>
                <View style={styles.messageArea}>
                    {message && (
                        <Text style={[styles.messageText, { fontSize: titleFontSize * 0.85 }, { color: message.color }]}>
                            {message.content}
                        </Text>
                    )}
                </View>

                <Text style={[styles.wordText, { fontSize: titleFontSize }]}>
                    {currentWord.prompt}
                </Text>

                <View style={styles.hintArea}>
                    {hintText && (
                        <Text style={[styles.hintText, { fontSize: normalFontSize }]}>
                            Hint: {hintText}
                        </Text>
                    )}
                </View>
            </View>

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
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={guessWord}
                        title="Submit"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleSkip}
                        title="Skip"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minWidth: 520,
        minHeight: 520,
        padding: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        justifyContent: 'space-between',
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
        fontWeight: '500',
    },
    timerText: {
        color: '#666',
        textAlign: 'center',
        marginTop: -2,
        fontWeight: '500',
    },
    timerTextDanger: {
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    wordText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    messageArea: {
        width: '100%',
        minHeight: 50,
        maxHeight: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    messageText: {
        fontWeight: '600',
        textAlign: 'center',
    },
    wordArea: {
        width: '100%',
        minHeight: 140,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    hintArea: {
        width: '100%',
        minHeight: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    inputWrapper: {
        width: '100%',
        marginVertical: 4,
    },
    input: {
        borderColor: '#d0d0d0',
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 12,
        height: 48,
        borderRadius: 8,
        width: '100%',
        backgroundColor: '#fafafa',
        fontSize: 16,
    },
    hintText: {
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
    },
    buttonRowCompact: {
        justifyContent: 'space-between',
    },
    buttonContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
});
