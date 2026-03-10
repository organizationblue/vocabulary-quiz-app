import { useEffect, useState } from 'react';
import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    useWindowDimensions
} from 'react-native'

interface WordProps {
    nickname: string;
}

export default function Word({ nickname }: WordProps) {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const { width } = useWindowDimensions();

    // Responsive font sizes based on screen width
    const titleFontSize = width * 0.06;
    const normalFontSize = width * 0.04;

    const [guess, setGuess] = useState<string>("");
    const [word, setWord] = useState<{ finnish: string, english: string }>({ finnish: "", english: "" });
    const [message, setMessage] = useState<{content: string, color: 'red'| 'green'}>();
    const [revealedLetters, setRevealedLetters] = useState<number>(0);

    /**
     * Fetch a random word from the backend API and set it to word state
     * 
     * https://www.cs.northwestern.edu/courses/394/guides/intro-react-native/intro-react-native-fetch-url.php
     */
    const fetchWord = async () => {
        try {
            const response = await fetch(API_URL + '/api/word');
            const json = await response.json();

            if (!response.ok) {
                console.error(json.message + ' ' + json.error);
                alert("Failed to fetch word from server: " + json.message);
                return;
            }

            setWord(json.data);
            setRevealedLetters(0);
        } catch (error) {
            console.error("Error fetching word: ", error);
            alert("Error fetching word from server: " + error);
        }
    };
    /**
        * Generate hint text with revealed letters
        * .
        * Uses word and revealedLetters states
        */
    function generateHint(): string {
        if (!word.english || revealedLetters === 0) {
            return '';
        }

        const answer = word.english;
        let hint = '';

        for (let i = 0; i < answer.length; i++) {
            if (i < revealedLetters) {
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
     * Check if the quess is correct
     * Uses word and quess states
     */
    function guessWord() {
        if (guess.toLowerCase() === word.english.toLowerCase()) {
            setMessage({color: 'green', content: 'Your answer is correct'});
            nextWord();
        } else {
            const newRevealedCount = Math.min(revealedLetters + 1, word.english.length);
            setRevealedLetters(newRevealedCount);

            if (newRevealedCount >= word.english.length) {
                setMessage({ color: 'red', content: `Wrong answer. The correct answer is: ${word.english}` });
            } else {
                setMessage({ color: 'red', content: 'Your answer is wrong' });
            }
        }
    }
    function nextWord() {
        setGuess("");
        setRevealedLetters(0);
        fetchWord();
    }

    useEffect(() => {
        fetchWord();
    }, []);

    function changeGuess(newguess: string) {
        setMessage(undefined);
        setGuess(newguess);
    }

    const hintText = generateHint();

    return (
        <View style={styles.container}>

            <Text style={[styles.nicknameText, {fontSize: normalFontSize}]}>
                Playing as: {nickname}
            </Text>
            {message && <Text style={
                    [styles.wordText, { fontSize: titleFontSize }, {color: message.color}]}>{message.content}</Text>}

            <Text style={[styles.wordText, { fontSize: titleFontSize }]}>
                Word: {word.finnish}
            </Text>

            {hintText && (
                <Text style={[styles.hintText, { fontSize: normalFontSize }]}>
                    Hint: {hintText}
                </Text>
            )}

            <TextInput
                placeholder='Type in the translation'
                style={[
                    styles.input,
                    { fontSize: normalFontSize }
                ]}
                onChangeText={changeGuess}
                value={guess}
            />

            <Button
                onPress={guessWord}
                title="Submit"
            />
            <Button
                onPress={nextWord}
                title="Next Word"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12
    },
    wordText: {
        fontWeight: 'bold'
    },
    label: {
        color: '#0d0c0c'
    },
    input: {
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10,
        borderRadius: 6
    },
    hintText: {
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8
    },
    nicknameText: {
        color: '#666',
        marginBottom: 8
    }
});