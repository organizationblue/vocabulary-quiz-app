import {View, StyleSheet, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Word from '../components/Word';
import { RootStackParamList } from '../types/navigation';
import { useEffect, useState } from 'react';
import { Text, Button } from 'react-native-paper';
import type { Word as WordType } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const SESSION_SIZE = 20;

const calculateWordScore = (wrongAttempts: number, wordLength: number): number => {
    const raw = Math.max(0, wordLength - wrongAttempts) / wordLength;
    return Math.round(raw * 10) / 10;
};

export default function GameScreen({ route, navigation }: Props) {
    const { nickname } = route.params;
    const { width } = useWindowDimensions();
    const titleFontSize = Math.min(width * 0.06, 48);
    const normalFontSize = Math.min(width * 0.04, 20);

    const [wordPool, setWordPool] = useState<WordType[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const saveScore = async (finalScore: number) => {
        try {
            await fetch(`${API_URL}/api/score`, {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({ nickname, score: finalScore }),
            });
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };
        
    

    const startSession = async () => {
        try {
            setLoading(true);
            setScore(0);
            setWrongAttempts(0);
            setCurrentWordIndex(0);
            setGameOver(false);

            const response = await fetch(`${API_URL}/api/words?count=${SESSION_SIZE}`);
            const json = await response.json();

            if (!response.ok) {
                alert("Failed to fetch words from server: " + json.message);
                return;
            }

            setWordPool(json.data);
        } catch (error) {
            console.error("Error starting game: ", error);
            alert("Error fetching words from server: " + error);
        } finally {
            setLoading(false);
        }
    };

    const advanceWord = (currentScore: number) => {
        const nextIndex = currentWordIndex + 1;
        if (nextIndex >= SESSION_SIZE) {
            setGameOver(true);
            saveScore(currentScore);
        } else {
            setCurrentWordIndex(nextIndex);
            setWrongAttempts(0);
        }
    };

    const handleCorrectAnswer = () => {
        const currentWord = wordPool[currentWordIndex];
        if (!currentWord) return;
        const wordScore = calculateWordScore(wrongAttempts, currentWord.english.length);
        const newScore = Math.round((score + wordScore) * 10) / 10;        setScore(newScore);
        advanceWord(newScore);
    };

    const handleWrongAnswer = () => {
        setWrongAttempts(prev => prev + 1);
    };

    const handleSkip = () => {
        advanceWord(score);
    };

    useEffect(() => {
        startSession();
    }, []);

    const currentWord = wordPool[currentWordIndex];

    if (loading || !currentWord) {
        return (
            <View style={styles.container}>
                <Text style={{ fontSize: normalFontSize, marginBottom: 20 }}>
                    Loading...
                </Text>
            </View>
        );
    }

    if (gameOver) {
        return (
            <View style={styles.container}>
                <ConfettiCannon
                    count={100}
                    origin={{ x: -10, y: 0 }}
                    autoStart
                />
                <Text style={[styles.resultTitle, { fontSize: titleFontSize }]}>
                    Game Over!
                </Text>
                <Text style={[styles.resultScore, { fontSize: titleFontSize * 1.5 }]}>
                    Your Score: {score} / {SESSION_SIZE}
                </Text>

                <Text style={[styles.resultNickname, { fontSize: normalFontSize }]}>
                    Well done, {nickname}!
                </Text>

                <Button
                    mode="contained"
                    onPress={startSession}
                    style={styles.button}
                >
                    Play Again
                </Button>

                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('Nickname')}
                    style={styles.button}
                >
                    Change Nickname
                </Button>
                </View>
        );
    }
    

    return (
        <View style={styles.container}>
            <Word 
                nickname={nickname}
                currentWord={currentWord}
                wrongAttempts={wrongAttempts}
                score={score}
                currentWordNumber={currentWordIndex + 1}
                sessionSize={SESSION_SIZE}
                onCorrectAnswer={handleCorrectAnswer}
                onWrongAnswer={handleWrongAnswer}
                onSkip={handleSkip}
                
            />
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
    resultTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    resultScore: {
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 16,
        textAlign: 'center',
    },
    resultNickname: {
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginTop: 8,
    }
});
