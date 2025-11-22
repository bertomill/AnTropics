import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, CompletedExercise, Achievement} from '../types';

export default function StatsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [completedExercises, setCompletedExercises] = useState<
    CompletedExercise[]
  >([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'achievements'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await loadUser();
    setUser(userData);

    const exercises = await loadCompletedExercises();
    setCompletedExercises(exercises);

    const achievementsList = getAchievements(userData, exercises);
    setAchievements(achievementsList);
  };

  const getTodayExercises = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completedExercises.filter(
      ex => new Date(ex.completedAt) >= today,
    ).length;
  };

  const getWeekExercises = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedExercises.filter(
      ex => new Date(ex.completedAt) >= weekAgo,
    ).length;
  };

  const getTotalMinutes = () => {
    return Math.floor(
      completedExercises.reduce((sum, ex) => sum + ex.duration, 0) / 60,
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'overview' && styles.activeTabText,
            ]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'history' && styles.activeTabText,
            ]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'achievements' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('achievements')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'achievements' && styles.activeTabText,
            ]}>
            Achievements
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && (
          <View>
            {/* Main Stats */}
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.points}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getTodayExercises()}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{getWeekExercises()}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
            </View>

            {/* Additional Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Total Exercises Completed
                  </Text>
                  <Text style={styles.summaryValue}>
                    {completedExercises.length}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Time Spent</Text>
                  <Text style={styles.summaryValue}>
                    {getTotalMinutes()} minutes
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Current Level</Text>
                  <Text style={styles.summaryValue}>Level {user.level}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Achievements Unlocked</Text>
                  <Text style={styles.summaryValue}>
                    {achievements.filter(a => a.unlocked).length} /{' '}
                    {achievements.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress to next level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Level Progress</Text>
              <View style={styles.progressCard}>
                <View style={styles.levelInfo}>
                  <Text style={styles.currentLevel}>Level {user.level}</Text>
                  <Text style={styles.nextLevel}>
                    Level {user.level + 1}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {width: `${(user.points % 100)}%`},
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {user.points % 100} / 100 points to next level
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'history' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercise History</Text>
            {completedExercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No exercises completed yet. Start your first break!
                </Text>
              </View>
            ) : (
              completedExercises
                .slice()
                .reverse()
                .map((exercise, index) => (
                  <View key={exercise.id || index} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Text style={styles.historyIconText}>✓</Text>
                    </View>
                    <View style={styles.historyDetails}>
                      <Text style={styles.historyTitle}>
                        Exercise Completed
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(exercise.completedAt).toLocaleDateString()}{' '}
                        at{' '}
                        {new Date(exercise.completedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.historyPoints}>
                      <Text style={styles.historyPointsText}>
                        +{exercise.points}
                      </Text>
                    </View>
                  </View>
                ))
            )}
          </View>
        )}

        {selectedTab === 'achievements' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.map(achievement => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.lockedAchievement,
                ]}>
                <Text
                  style={[
                    styles.achievementIcon,
                    !achievement.unlocked && styles.lockedIcon,
                  ]}>
                  {achievement.icon}
                </Text>
                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementName}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <Text style={styles.achievementDate}>
                      Unlocked{' '}
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.achievementPoints}>
                  {achievement.points} pts
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper functions
async function loadUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

async function loadCompletedExercises(): Promise<CompletedExercise[]> {
  const data = await AsyncStorage.getItem('completed_exercises');
  return data ? JSON.parse(data) : [];
}

function getAchievements(
  user: User | null,
  exercises: CompletedExercise[],
): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first exercise',
      icon: '🌱',
      unlocked: exercises.length >= 1,
      unlockedAt: exercises[0]?.completedAt,
      points: 10,
    },
    {
      id: '2',
      name: 'Dedicated',
      description: 'Complete 10 exercises',
      icon: '🌿',
      unlocked: exercises.length >= 10,
      points: 50,
    },
    {
      id: '3',
      name: 'Wellness Warrior',
      description: 'Complete 50 exercises',
      icon: '🌳',
      unlocked: exercises.length >= 50,
      points: 100,
    },
    {
      id: '4',
      name: 'Week Streak',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      unlocked: (user?.streak || 0) >= 7,
      points: 75,
    },
    {
      id: '5',
      name: 'Point Collector',
      description: 'Earn 500 points',
      icon: '⭐',
      unlocked: (user?.points || 0) >= 500,
      points: 50,
    },
    {
      id: '6',
      name: 'Early Bird',
      description: 'Complete an exercise before 9 AM',
      icon: '🌅',
      unlocked: false,
      points: 25,
    },
  ];

  return achievements;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  nextLevel: {
    fontSize: 16,
    color: '#999',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyPoints: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  historyPointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  achievementCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  lockedIcon: {
    opacity: 0.3,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  achievementDate: {
    fontSize: 11,
    color: '#4CAF50',
  },
  achievementPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
});
