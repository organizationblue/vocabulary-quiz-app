import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Menu } from 'react-native-paper';
import { LANGUAGE_OPTIONS, Language } from '../types/navigation';
import type { ScoreUser, ScoreEntry } from '../types/scoreboard';

// Expo public env var
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

const Scoreboard: React.FC = () => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<Language | 'any'>('any');
  const [targetLanguage, setTargetLanguage] = useState<Language | 'any'>('any');
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [targetMenuVisible, setTargetMenuVisible] = useState(false);

  const fetchScores = () => {
    setLoading(true);
    setError(null);
    let url = `${API_URL}/api/scores?limit=10`;
    if (sourceLanguage !== 'any' && targetLanguage !== 'any') {
      url += `&sourceLanguage=${sourceLanguage}&targetLanguage=${targetLanguage}`;
    } else if (sourceLanguage !== 'any' && targetLanguage === 'any') {
      url += `&sourceLanguage=${sourceLanguage}`;
    } else if (sourceLanguage === 'any' && targetLanguage !== 'any') {
      url += `&targetLanguage=${targetLanguage}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setScores(data.data);
        } else {
          setError(data.message || 'Failed to load scores');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load scores');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLanguage, targetLanguage]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>🏆 Scoreboard</Text>
        <View style={styles.langSelectors}>
          <Menu
            visible={sourceMenuVisible}
            onDismiss={() => setSourceMenuVisible(false)}
            anchor={
              <Pressable style={styles.selector} onPress={() => setSourceMenuVisible(true)}>
                <Text style={styles.selectorLabel}>
                  {sourceLanguage === 'any'
                    ? 'Any Source'
                    : LANGUAGE_OPTIONS.find(l => l.value === sourceLanguage)?.label}
                </Text>
              </Pressable>
            }
          >
            <Menu.Item
              key="any-source"
              onPress={() => {
                setSourceLanguage('any');
                setSourceMenuVisible(false);
              }}
              title="Any Source"
            />
            {LANGUAGE_OPTIONS.filter(l => l.value !== targetLanguage).map(option => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setSourceLanguage(option.value as Language);
                  setSourceMenuVisible(false);
                }}
                title={option.label}
              />
            ))}
          </Menu>
          <Text style={{ marginHorizontal: 8, fontSize: 18 }}>→</Text>
          <Menu
            visible={targetMenuVisible}
            onDismiss={() => setTargetMenuVisible(false)}
            anchor={
              <Pressable style={styles.selector} onPress={() => setTargetMenuVisible(true)}>
                <Text style={styles.selectorLabel}>
                  {targetLanguage === 'any'
                    ? 'Any Target'
                    : LANGUAGE_OPTIONS.find(l => l.value === targetLanguage)?.label}
                </Text>
              </Pressable>
            }
          >
            <Menu.Item
              key="any-target"
              onPress={() => {
                setTargetLanguage('any');
                setTargetMenuVisible(false);
              }}
              title="Any Target"
            />
            {LANGUAGE_OPTIONS.filter(l => l.value !== sourceLanguage).map(option => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setTargetLanguage(option.value as Language);
                  setTargetMenuVisible(false);
                }}
                title={option.label}
              />
            ))}
          </Menu>
        </View>
        <FlatList
          data={scores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let rowStyle = [styles.row];
            if (item.rank === 1) rowStyle.push(styles.gold);
            else if (item.rank === 2) rowStyle.push(styles.silver);
            else if (item.rank === 3) rowStyle.push(styles.bronze);
            // Format date and time
            const dateObj = new Date(item.createdAt);
            // Format as DD/MM/YYYY
            const dateStr = dateObj.toLocaleDateString('en-GB');
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            return (
              <View style={rowStyle}>
                <Text style={styles.rank}>{item.rank}.</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.user.displayName || item.user.username}</Text>
                  <Text style={styles.datetime}>{dateStr} {timeStr}</Text>
                </View>
                <Text style={styles.score}>{item.score}</Text>
                <Text style={styles.lang}>{item.sourceLanguage} → {item.targetLanguage}</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f3f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#2a3a4b',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e8ee',
    borderRadius: 10,
    marginBottom: 2,
    backgroundColor: '#f8fafc',
  },
  rank: {
    width: 32,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    fontSize: 17,
    color: '#2a3a4b',
    fontWeight: '500',
    marginLeft: 2,
  },
  score: {
    width: 60,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e7e34',
  },
  lang: {
    width: 90,
    textAlign: 'right',
    color: '#6c757d',
    fontSize: 14,
    marginLeft: 8,
  },
  datetime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  langSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  selector: {
    backgroundColor: '#f3f6fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e3e8ee',
    minWidth: 110,
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 15,
    color: '#2a3a4b',
  },
  gold: {
    backgroundColor: '#fffbe6',
    borderColor: '#ffe066',
    borderWidth: 1,
  },
  silver: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ced4da',
    borderWidth: 1,
  },
  bronze: {
    backgroundColor: '#fff4e6',
    borderColor: '#ffa94d',
    borderWidth: 1,
  },
  error: {
    color: 'red',
    marginTop: 40,
    textAlign: 'center',
  },
});

export default Scoreboard;
