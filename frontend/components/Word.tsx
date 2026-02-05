import { use, useEffect, useState } from 'react';
import { Button, Text, TextInput } from 'react-native'

export default function Word() {
    const API_URL = "http://127.0.0.1:3000";
    const [quess, setQuess] = useState<string>("");
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
    function quessWord() {
        if (quess.toLowerCase() === word.english.toLowerCase()) {
            alert("correct");
        } else {
            alert("wrong answer, correct is: " + word.english);
        }
    }
    useEffect(() => {
        fetchWord();
    }, []);

    return (
        <>
            <Text>word: {word.finnish}</Text>
            <Text>translation</Text>
            <TextInput
                placeholder='try to translate the word'
                style={{
                    borderColor: 'grey',
                    borderWidth: 1
                }}
                onChangeText={setQuess}
                value={quess}
            />

            <Button
                onPress={quessWord}
                title="answer"
            />
        </>
    );
}