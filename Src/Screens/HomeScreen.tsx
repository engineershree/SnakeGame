import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const HomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐍 Snake Game</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </Pressable>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#22c55e',
    borderRadius: 10,
  },
  buttonText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
