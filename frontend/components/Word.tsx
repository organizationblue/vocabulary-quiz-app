import { useEffect, useState } from 'react';
import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    useWindowDimensions
} from 'react-native'

export default function Word() {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const { width } = useWindowDimensions();

    // Responsive font sizes based on screen width
    const titleFontSize = width * 0.06;
    const normalFontSize = width * 0.04;

    const [guess, setGuess] = useState<string>("");
    const [word, setWord] = useState<{ finnish: string, english: string }>({ finnish: "", english: "" });

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
        } catch (error) {
            console.error("Error fetching word: ", error);
            alert("Error fetching word from server: " + error);
        }
    };

    /**
     * Check if the quess is correct
     * Uses word and quess states
     */
    function guessWord() {
        if (guess === word.english) {
            alert("Correct!");
        } else {
            alert("Incorrect, the correct translation is: " + word.english);
        }
    }
    function nextWord() {
        setGuess("");
        fetchWord();
    }

    useEffect(() => {
        fetchWord();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={[styles.wordText, { fontSize: titleFontSize }]}>
                Word: {word.finnish}
            </Text>

            <TextInput
                placeholder='Type in the translation'
                style={[
                    styles.input,
                    { fontSize: normalFontSize }
                ]}
                onChangeText={setGuess}
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
    }
});