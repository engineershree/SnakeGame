import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Pressable,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureScreen from './GestureScreen';

const { width } = Dimensions.get('window');
const GRID_SIZE = 20;
const BOARD_SIZE = Math.min(width * 0.9, 360);
const CELL_SIZE = Math.floor(BOARD_SIZE / GRID_SIZE);

type Block = { x: number; y: number };

const GameScreen = () => {
  const navigation = useNavigation<any>();

  /* 🔒 Tutorial Gate */
  const [tutorialDone, setTutorialDone] = useState(false);

  /* 🐍 Game State */
  const [snake, setSnake] = useState<Block[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  const [direction, setDirection] =
    useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [food, setFood] = useState<Block>({ x: 10, y: 10 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* 🎉 High-Score Popup */
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [showPopup, setShowPopup] = useState(false);
  const popupTriggered = useRef(false);
  // Track highScore before update to detect when it's first exceeded
  const highScoreBeforeUpdateRef = useRef(0);

  /* Load High Score */
  useEffect(() => {
    AsyncStorage.getItem('HIGH_SCORE').then(v => {
      if (v) {
        const loadedHighScore = Number(v);
        setHighScore(loadedHighScore);
        highScoreBeforeUpdateRef.current = loadedHighScore; // Fix: Sync ref with loaded value
      }
    });
  }, []);

  /* Update High Score State Immediately */
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('HIGH_SCORE', score.toString());
    }
  }, [score, highScore]);

  /* Trigger High Score Popup */
  useEffect(() => {
    // Trigger popup when score exceeds the highScore value BEFORE it gets updated
    if (
      score > highScoreBeforeUpdateRef.current &&
      score > 0 &&
      !popupTriggered.current &&
      !gameOver &&
      tutorialDone
    ) {
      popupTriggered.current = true;
      setShowPopup(true);

      Animated.sequence([
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowPopup(false));
    }
    // Update ref AFTER checking, so next time it has the previous value
    highScoreBeforeUpdateRef.current = highScore;
  }, [score, highScore, gameOver, tutorialDone, popupOpacity]);

  const generateFood = useCallback((s: Block[]) => {
    let f: Block;
    do {
      f = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (s.some(b => b.x === f.x && b.y === f.y));
    setFood(f);
  }, []);

  const getGameSpeed = useCallback(() => Math.max(200 - score * 10, 60), [score]);

  const moveSnake = useCallback(() => {
    setSnake(prev => {
      const head = prev[0];
      const next = { ...head };

      if (direction === 'UP') next.y--;
      if (direction === 'DOWN') next.y++;
      if (direction === 'LEFT') next.x--;
      if (direction === 'RIGHT') next.x++;

      if (
        next.x < 0 ||
        next.y < 0 ||
        next.x >= GRID_SIZE ||
        next.y >= GRID_SIZE ||
        prev.slice(1).some(b => b.x === next.x && b.y === next.y)
      ) {
        setGameOver(true);
        return prev;
      }

      const updated = [next, ...prev];
      if (next.x === food.x && next.y === food.y) {
        setScore(s => s + 1);
        generateFood(updated);
      } else {
        updated.pop();
      }
      return updated;
    });
  }, [direction, food, generateFood]);

  useEffect(() => {
    if (!tutorialDone || gameOver) return;
    const id = setInterval(moveSnake, getGameSpeed());
    return () => clearInterval(id);
  }, [tutorialDone, gameOver, moveSnake, getGameSpeed]);

  const resetGame = () => {
    // Reset all game state
    setSnake([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]);
    setDirection('RIGHT'); // Fix: Reset direction to prevent wrong starting direction
    setScore(0);
    setGameOver(false);
    // Reset popup state
    popupTriggered.current = false;
    setShowPopup(false); // Fix: Reset popup visibility state
    popupOpacity.setValue(0);
    popupOpacity.stopAnimation(); // Fix: Stop any running popup animation
    // Sync highScore ref with current highScore value for popup tracking
    highScoreBeforeUpdateRef.current = highScore;
    // Generate new food for the new game
    generateFood([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => tutorialDone && !gameOver,
    onPanResponderRelease: (_, g) => {
      const { dx, dy } = g;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && direction !== 'LEFT') setDirection('RIGHT');
        else if (dx < -20 && direction !== 'RIGHT') setDirection('LEFT');
      } else {
        if (dy > 20 && direction !== 'UP') setDirection('DOWN');
        else if (dy < -20 && direction !== 'DOWN') setDirection('UP');
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {!tutorialDone && <GestureScreen onComplete={() => setTutorialDone(true)} />}

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.highScore}>Best: {highScore}</Text>
      </View>

      <Text style={styles.speed}>Speed: {Math.round(1000 / getGameSpeed())}</Text>

      <View style={styles.board}>
        {snake.map((b, i) => {
          const isHead = i === 0;
          return (
            <View
              key={i}
              style={[
                styles.snake,
                isHead && styles.head,
                { left: b.x * CELL_SIZE, top: b.y * CELL_SIZE },
              ]}
            >
              {isHead && (
                <View
                  style={[
                    styles.eyes,
                    direction === 'UP' && styles.eyesUp,
                    direction === 'DOWN' && styles.eyesDown,
                    direction === 'LEFT' && styles.eyesLeft,
                    direction === 'RIGHT' && styles.eyesRight,
                  ]}
                >
                  <View style={styles.eye} />
                  <View style={styles.eye} />
                </View>
              )}
            </View>
          );
        })}
        <View
          style={[
            styles.food,
            { left: food.x * CELL_SIZE, top: food.y * CELL_SIZE },
          ]}
        />
      </View>

      {gameOver && (
        <View style={styles.gameOverBox}>
          <Text style={styles.gameOver}>Game Over 💀</Text>
          <Pressable style={styles.restartBtn} onPress={resetGame}>
            <Text style={styles.restartText}>Restart</Text>
          </Pressable>
        </View>
      )}

      {showPopup && (
        <Animated.View style={[styles.popup, { opacity: popupOpacity }]}>
          <Text style={styles.popupText}>🎉 New High Score!</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default GameScreen;

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 60,
    alignItems: 'center',
  },

  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    borderWidth: 1,
    borderColor: '#22c55e',
    padding: 6,
    borderRadius: 8,
  },
  backText: {
    color: '#22c55e',
    fontWeight: 'bold',
  },

  header: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  score: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  highScore: {
    color: '#facc15',
    fontSize: 16,
    fontWeight: 'bold',
  },
  speed: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },

  board: {
    width: CELL_SIZE * GRID_SIZE,
    height: CELL_SIZE * GRID_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#020617',
    elevation: 10,
  },

  snake: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#22c55e',
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  head: {
    backgroundColor: '#16a34a',
    borderWidth: 2,
    borderColor: '#14532d',
  },

  eyes: {
    position: 'absolute',
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eye: {
    width: 4,
    height: 4,
    backgroundColor: '#020617',
    borderRadius: 2,
  },
  eyesUp: { top: 4, left: '20%' },
  eyesDown: { bottom: 4, left: '20%' },
  eyesLeft: { left: 4, top: '30%', flexDirection: 'column' },
  eyesRight: { right: 4, top: '30%', flexDirection: 'column' },

  food: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#ef4444',
    position: 'absolute',
    borderRadius: CELL_SIZE / 2,
  },

  gameOverBox: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 15,
  },
  gameOver: {
    color: '#ef4444',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(239,68,68,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  restartBtn: {
    marginTop: 10,
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  restartText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
  },

  popup: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    zIndex: 999,
    elevation: 12,
  },
  popupText: {
    color: '#020617',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
