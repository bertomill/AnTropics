import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BreakReminderService from '../services/BreakReminderService';
import {User, BreakReminder} from '../types';

export default function HomeScreen({navigation}: any) {
  const [user, setUser] = useState<User | null>(null);
  const [nextBreak, setNextBreak] = useState<BreakReminder | null>(null);
  const [timeUntilBreak, setTimeUntilBreak] = useState<string>('');

  useEffect(() => {
    initializeApp();
    const interval = setInterval(updateNextBreak, 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeApp = async () => {
    await BreakReminderService.initialize();

    // Load or create user
    let userData = await loadUser();
    if (!userData) {
      userData = createDefaultUser();
      await saveUser(userData);
    }
    setUser(userData);

    // Schedule break reminders
    await BreakReminderService.scheduleReminders(userData.settings);
    updateNextBreak();
  };

  const updateNextBreak = () => {
    const next = BreakReminderService.getNextBreak();
    setNextBreak(next);

    if (next) {
      const now = new Date().getTime();
      const breakTime = new Date(next.scheduledTime).getTime();
      const diff = breakTime - now;

      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilBreak(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilBreak('Now!');
      }
    }
  };

  const handleTakeBreakNow = () => {
    navigation.navigate('Break');
  };

  const handleViewStats = () => {
    navigation.navigate('Stats');
  };

  const handleTalkToCompanion = () => {
    navigation.navigate('Companion');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user.name}!</Text>
        <Text style={styles.subtitle}>Let's keep you healthy today</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>Lv {user.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      {/* Next Break Card */}
      {nextBreak && (
        <View style={styles.breakCard}>
          <Text style={styles.breakTitle}>Next Break</Text>
          <Text style={styles.breakTime}>{timeUntilBreak}</Text>
          <Text style={styles.breakType}>
            {nextBreak.type === 'micro'
              ? '⏸️ Micro Break'
              : nextBreak.type === 'stretch'
              ? '🧘 Stretch Break'
              : '👀 Eye Break'}
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleTakeBreakNow}>
          <Text style={styles.actionIcon}>🧘</Text>
          <Text style={styles.actionText}>Take Break Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTalkToCompanion}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Talk to AI Companion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleViewStats}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>View Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Wellness Tip</Text>
        <Text style={styles.tipText}>
          Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet
          away for 20 seconds to reduce eye strain.
        </Text>
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

function createDefaultUser(): User {
  return {
    id: Date.now().toString(),
    name: 'User',
    points: 0,
    streak: 0,
    level: 1,
    settings: {
      breakInterval: 30,
      notificationsEnabled: true,
      soundEnabled: true,
      workHoursStart: '09:00',
      workHoursEnd: '17:00',
      weekendsEnabled: false,
    },
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -20,
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 15,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  breakCard: {
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
  breakTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  breakTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  breakType: {
    fontSize: 18,
    color: '#333',
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: '#4CAF50',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: '#FFF3CD',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
