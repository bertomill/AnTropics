import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {VirtualPet, User} from '../types';

export default function PetScreen({navigation}: any) {
  const [pet, setPet] = useState<VirtualPet | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadPetAndUser();
  }, []);

  const loadPetAndUser = async () => {
    const userData = await loadUser();
    setUser(userData);

    let petData = await loadPet();
    if (!petData) {
      // Create new pet
      petData = createDefaultPet();
      await savePet(petData);
    } else {
      // Update pet health based on time since last interaction
      petData = updatePetStatus(petData);
      await savePet(petData);
    }
    setPet(petData);
  };

  const updatePetStatus = (pet: VirtualPet): VirtualPet => {
    if (!pet.lastFed) return pet;

    const hoursSinceLastFed =
      (Date.now() - new Date(pet.lastFed).getTime()) / (1000 * 60 * 60);

    // Decrease health and happiness over time
    let healthDecay = Math.floor(hoursSinceLastFed * 2);
    let happinessDecay = Math.floor(hoursSinceLastFed * 3);

    return {
      ...pet,
      health: Math.max(0, pet.health - healthDecay),
      happiness: Math.max(0, pet.happiness - happinessDecay),
    };
  };

  const feedPet = async () => {
    if (!pet || !user) return;

    // Feeding cost
    const cost = 20;
    if (user.points < cost) {
      Alert.alert(
        'Not enough points',
        `You need ${cost} points to feed your pet. Complete more exercises to earn points!`,
      );
      return;
    }

    // Update pet
    const updatedPet: VirtualPet = {
      ...pet,
      health: Math.min(100, pet.health + 20),
      happiness: Math.min(100, pet.happiness + 15),
      lastFed: new Date(),
    };

    // Deduct points from user
    const updatedUser: User = {
      ...user,
      points: user.points - cost,
    };

    await savePet(updatedPet);
    await saveUser(updatedUser);
    setPet(updatedPet);
    setUser(updatedUser);

    Alert.alert('🌱 Pet Fed!', 'Your companion is happy and healthy!');
  };

  const playWithPet = async () => {
    if (!pet) return;

    const updatedPet: VirtualPet = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 10),
      health: Math.max(0, pet.health - 5), // Playing uses energy
    };

    await savePet(updatedPet);
    setPet(updatedPet);

    Alert.alert('🎉 Playtime!', 'Your companion enjoyed playing with you!');
  };

  const renamePet = () => {
    Alert.prompt(
      'Rename Pet',
      'Enter a new name for your companion:',
      async (newName: string) => {
        if (pet && newName.trim()) {
          const updatedPet = {...pet, name: newName.trim()};
          await savePet(updatedPet);
          setPet(updatedPet);
        }
      },
    );
  };

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text>Loading your companion...</Text>
      </View>
    );
  }

  const getPetEmoji = () => {
    if (pet.health < 30) return '🥀';
    if (pet.health < 60) return '🌱';
    if (pet.health < 90) return '🌿';
    return '🌳';
  };

  const getPetMood = () => {
    if (pet.happiness < 30) return '😢';
    if (pet.happiness < 60) return '😐';
    if (pet.happiness < 90) return '😊';
    return '😄';
  };

  const getHealthColor = (value: number) => {
    if (value < 30) return '#F44336';
    if (value < 60) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Pet Display */}
      <View style={styles.petContainer}>
        <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
        <TouchableOpacity onPress={renamePet}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.renameHint}>Tap to rename</Text>
        </TouchableOpacity>
        <Text style={styles.petMood}>{getPetMood()}</Text>
        <Text style={styles.petLevel}>Level {pet.level}</Text>
      </View>

      {/* Status Bars */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Health</Text>
          <View style={styles.statBarContainer}>
            <View
              style={[
                styles.statBar,
                {
                  width: `${pet.health}%`,
                  backgroundColor: getHealthColor(pet.health),
                },
              ]}
            />
          </View>
          <Text style={styles.statValue}>{pet.health}%</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Happiness</Text>
          <View style={styles.statBarContainer}>
            <View
              style={[
                styles.statBar,
                {
                  width: `${pet.happiness}%`,
                  backgroundColor: getHealthColor(pet.happiness),
                },
              ]}
            />
          </View>
          <Text style={styles.statValue}>{pet.happiness}%</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={feedPet}>
          <Text style={styles.actionIcon}>🍎</Text>
          <Text style={styles.actionText}>Feed Pet</Text>
          <Text style={styles.actionCost}>20 points</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={playWithPet}>
          <Text style={styles.actionIcon}>🎾</Text>
          <Text style={styles.actionText}>Play</Text>
          <Text style={styles.actionCost}>Free</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How it works</Text>
        <Text style={styles.infoText}>
          • Your companion thrives when you take care of yourself{'\n'}
          • Complete exercises to earn points{'\n'}
          • Feed your pet to keep it healthy{'\n'}
          • Play to increase happiness{'\n'}
          • Don't forget to check in daily!
        </Text>
      </View>

      {/* Warning if pet is unhealthy */}
      {(pet.health < 30 || pet.happiness < 30) && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Your pet needs attention!</Text>
          <Text style={styles.warningText}>
            {pet.health < 30 && 'Feed your pet to restore health.\n'}
            {pet.happiness < 30 &&
              'Play with your pet or complete exercises to boost happiness.'}
          </Text>
        </View>
      )}

      {/* Earn Points Reminder */}
      <TouchableOpacity
        style={styles.earnPointsButton}
        onPress={() => navigation.navigate('Break')}>
        <Text style={styles.earnPointsText}>
          Complete an exercise to earn points
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Helper functions
async function loadPet(): Promise<VirtualPet | null> {
  const data = await AsyncStorage.getItem('virtual_pet');
  return data ? JSON.parse(data) : null;
}

async function savePet(pet: VirtualPet): Promise<void> {
  await AsyncStorage.setItem('virtual_pet', JSON.stringify(pet));
}

async function loadUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

function createDefaultPet(): VirtualPet {
  return {
    id: Date.now().toString(),
    name: 'Sprout',
    type: 'plant',
    health: 100,
    happiness: 100,
    level: 1,
    lastFed: new Date(),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  petContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petEmoji: {
    fontSize: 100,
    marginBottom: 15,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  renameHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  petMood: {
    fontSize: 40,
    marginTop: 10,
  },
  petLevel: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 10,
  },
  statsContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  statBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  statBar: {
    height: '100%',
    borderRadius: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 45,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  actionCost: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  earnPointsButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  earnPointsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
