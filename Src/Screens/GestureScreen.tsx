import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
} from 'react-native';

type Direction = 'RIGHT' | 'DOWN' | 'LEFT' | 'UP';

const tutorialSteps: Direction[] = ['RIGHT', 'DOWN', 'LEFT', 'UP'];

type Props = {
  onComplete: () => void; // callback to unlock game
};

const GestureScreen = ({ onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);

  const currentDirection = tutorialSteps[stepIndex];

  // Animated values for the current arrow
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Animation effect for current direction
  useEffect(() => {
    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Reset all animated values
    translateX.setValue(0);
    translateY.setValue(0);
    scale.setValue(1);
    opacity.setValue(1);

    // Create slide animation based on direction
    let slideAnimation: Animated.CompositeAnimation;
    let slideBackAnimation: Animated.CompositeAnimation;

    switch (currentDirection) {
      case 'RIGHT':
        slideAnimation = Animated.timing(translateX, {
          toValue: 20,
          duration: 600,
          useNativeDriver: true,
        });
        slideBackAnimation = Animated.timing(translateX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        });
        break;
      case 'LEFT':
        slideAnimation = Animated.timing(translateX, {
          toValue: -20,
          duration: 600,
          useNativeDriver: true,
        });
        slideBackAnimation = Animated.timing(translateX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        });
        break;
      case 'DOWN':
        slideAnimation = Animated.timing(translateY, {
          toValue: 20,
          duration: 600,
          useNativeDriver: true,
        });
        slideBackAnimation = Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        });
        break;
      case 'UP':
        slideAnimation = Animated.timing(translateY, {
          toValue: -20,
          duration: 600,
          useNativeDriver: true,
        });
        slideBackAnimation = Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        });
        break;
    }

    // Create pulse animation (scale + opacity)
    const pulseUp = Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.7,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    const pulseDown = Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    const pulseSequence = Animated.sequence([pulseUp, pulseDown]);

    // Create slide sequence
    const slideSequence = Animated.sequence([
      slideAnimation,
      Animated.delay(100),
      slideBackAnimation,
      Animated.delay(100),
    ]);

    // Run slide and pulse animations in parallel, then loop
    const combinedAnimation = Animated.parallel([
      Animated.loop(slideSequence),
      Animated.loop(pulseSequence),
    ]);

    animationRef.current = combinedAnimation;
    combinedAnimation.start();

    // Cleanup on unmount or direction change
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [currentDirection, translateX, translateY, scale, opacity]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, gesture) => {
      const { dx, dy } = gesture;

      let swipe: Direction | null = null;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) swipe = 'RIGHT';
        else if (dx < -30) swipe = 'LEFT';
      } else {
        if (dy > 30) swipe = 'DOWN';
        else if (dy < -30) swipe = 'UP';
      }

      if (!swipe) return;

      // ✅ Validate correct gesture order
      if (swipe === currentDirection) {
        // Stop current animation immediately
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }

        // Reset animated values
        translateX.setValue(0);
        translateY.setValue(0);
        scale.setValue(1);
        opacity.setValue(1);

        if (stepIndex === tutorialSteps.length - 1) {
          onComplete(); // 🎉 tutorial finished
        } else {
          setStepIndex(prev => prev + 1);
        }
      }
    },
  });

  // Render arrow based on direction
  const renderArrow = () => {
    return (
      <Animated.View
        style={[
          styles.arrowContainer,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
            opacity,
          },
        ]}
      >
        <View style={[styles.arrow, styles[currentDirection]]} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.overlay} {...panResponder.panHandlers}>
      <Text style={styles.title}>Gesture Tutorial</Text>
      <Text style={styles.subtitle}>Swipe in the shown direction</Text>

      {renderArrow()}

      <Text style={styles.stepText}>
        Step {stepIndex + 1} / {tutorialSteps.length}
      </Text>
    </View>
  );
};

export default GestureScreen;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  title: {
    fontSize: 22,
    color: '#22c55e',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },

  arrowContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    width: 40,
    height: 40,
    borderColor: '#22c55e',
  },

  RIGHT: {
    borderTopWidth: 6,
    borderRightWidth: 6,
    transform: [{ rotate: '45deg' }],
  },

  DOWN: {
    borderBottomWidth: 6,
    borderRightWidth: 6,
    transform: [{ rotate: '45deg' }],
  },

  LEFT: {
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    transform: [{ rotate: '45deg' }],
  },

  UP: {
    borderTopWidth: 6,
    borderLeftWidth: 6,
    transform: [{ rotate: '45deg' }],
  },

  stepText: {
    marginTop: 20,
    fontSize: 14,
    color: '#64748b',
  },
});
