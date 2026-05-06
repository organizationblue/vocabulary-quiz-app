import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Scoreboard from '../components/Scoreboard';

// Props for navigation

type Props = NativeStackScreenProps<RootStackParamList, 'Scoreboard'>;

const ScoreboardScreen: React.FC<Props> = ({ route }) => {
  // Optionally, you can use route.params to filter by language
  return (
    <View style={styles.container}>
      <Scoreboard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ScoreboardScreen;
