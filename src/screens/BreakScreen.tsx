import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Exercise, CompletedExercise, User} from '../types';
import {EXERCISES, getRecommendedExercise} from '../utils/exercises';

export default function BreakScreen({navigation}: any) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [isExercising, setIsExercising] = useState(false);
  const [timer, setTimer] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadRecommendedExercise();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExercising && selectedExercise) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= selectedExercise.duration) {
            completeExercise();
            return selectedExercise.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExercising, selectedExercise]);

  const loadRecommendedExercise = async () => {
    const user = await loadUser();
    let exercise: Exercise;

    if (user?.lastBreakTime) {
      const minutesSinceBreak = Math.floor(
        (Date.now() - new Date(user.lastBreakTime).getTime()) / 60000,
      );
      exercise = getRecommendedExercise(minutesSinceBreak);
    } else {
      exercise = EXERCISES[0];
    }

    setSelectedExercise(exercise);
  };

  const startExercise = () => {
    setIsExercising(true);
    setTimer(0);
    setCurrentStep(0);
  };

  const completeExercise = async () => {
    setIsExercising(false);

    if (!selectedExercise) return;

    // Save completed exercise
    const completed: CompletedExercise = {
      id: Date.now().toString(),
      exerciseId: selectedExercise.id,
      completedAt: new Date(),
      points: selectedExercise.points,
      duration: timer,
    };

    await saveCompletedExercise(completed);

    // Update user points and last break time
    const user = await loadUser();
    if (user) {
      user.points += selectedExercise.points;
      user.lastBreakTime = new Date();
      await saveUser(user);
    }

    // Navigate to completion screen or show success
    navigation.navigate('Home');
  };

  const selectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsExercising(false);
    setTimer(0);
    setCurrentStep(0);
  };

  if (!selectedExercise) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const progress = (timer / selectedExercise.duration) * 100;

  return (
    <ScrollView style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{selectedExercise.name}</Text>
        <Text style={styles.description}>{selectedExercise.description}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            ⏱️ {selectedExercise.duration}s
          </Text>
          <Text style={styles.metaText}>
            ⭐ {selectedExercise.points} points
          </Text>
          <Text style={styles.metaText}>
            🎯 {selectedExercise.targetArea}
          </Text>
        </View>
      </View>

      {/* Timer and Progress */}
      {isExercising && (
        <View style={styles.timerContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${progress}%`}]} />
          </View>
          <Text style={styles.timerText}>
            {timer}s / {selectedExercise.duration}s
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions</Text>
        {selectedExercise.instructions.map((instruction, index) => (
          <View
            key={index}
            style={[
              styles.instructionItem,
              isExercising && currentStep === index && styles.activeInstruction,
            ]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {!isExercising ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startExercise}>
            <Text style={styles.startButtonText}>Start Exercise</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={completeExercise}>
            <Text style={styles.completeButtonText}>Complete Early</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Other Exercises */}
      <View style={styles.otherExercisesContainer}>
        <Text style={styles.sectionTitle}>Other Exercises</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {EXERCISES.filter(ex => ex.id !== selectedExercise.id).map(
            exercise => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => selectExercise(exercise)}>
                <Text style={styles.exerciseCardTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseCardMeta}>
                  {exercise.duration}s · {exercise.points}pts
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

// Helper functions
async function loadUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

async function saveCompletedExercise(
  exercise: CompletedExercise,
): Promise<void> {
  const existingData = await AsyncStorage.getItem('completed_exercises');
  const exercises: CompletedExercise[] = existingData
    ? JSON.parse(existingData)
    : [];
  exercises.push(exercise);
  await AsyncStorage.setItem('completed_exercises', JSON.stringify(exercises));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  timerContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  instructionsContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  activeInstruction: {
    backgroundColor: '#E8F5E9',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  actionContainer: {
    padding: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#FF9800',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otherExercisesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  exerciseCardMeta: {
    fontSize: 12,
    color: '#666',
  },
});
