import notifee, {TimestampTrigger, TriggerType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BreakReminder, UserSettings} from '../types';

/**
 * Service for managing break reminders based on ultradian rhythms
 * Ultradian rhythms are 90-120 minute cycles of alertness
 * We schedule micro-breaks every 30-60 minutes within these cycles
 */
export class BreakReminderService {
  private static instance: BreakReminderService;
  private reminders: BreakReminder[] = [];

  // Ultradian rhythm constants
  private readonly ULTRADIAN_CYCLE = 90; // minutes
  private readonly MICRO_BREAK_INTERVAL = 30; // minutes
  private readonly STRETCH_BREAK_INTERVAL = 60; // minutes

  private constructor() {}

  static getInstance(): BreakReminderService {
    if (!BreakReminderService.instance) {
      BreakReminderService.instance = new BreakReminderService();
    }
    return BreakReminderService.instance;
  }

  /**
   * Initialize notification channel for break reminders
   */
  async initialize() {
    await notifee.requestPermission();

    await notifee.createChannel({
      id: 'break-reminders',
      name: 'Break Reminders',
      importance: 4,
      sound: 'default',
    });
  }

  /**
   * Schedule break reminders for the day based on user settings
   */
  async scheduleReminders(settings: UserSettings) {
    // Cancel existing reminders
    await this.cancelAllReminders();

    if (!settings.notificationsEnabled) {
      return;
    }

    const now = new Date();
    const workStart = this.parseTime(settings.workHoursStart);
    const workEnd = this.parseTime(settings.workHoursEnd);

    // Don't schedule on weekends if disabled
    if (!settings.weekendsEnabled && (now.getDay() === 0 || now.getDay() === 6)) {
      return;
    }

    let currentTime = new Date();
    currentTime.setHours(workStart.hours, workStart.minutes, 0, 0);

    const endTime = new Date();
    endTime.setHours(workEnd.hours, workEnd.minutes, 0, 0);

    let breakCount = 0;

    while (currentTime < endTime) {
      // Alternate between micro breaks and stretch breaks
      const isMicroBreak = breakCount % 2 === 0;
      const breakType = isMicroBreak ? 'micro' : 'stretch';
      const interval = isMicroBreak
        ? this.MICRO_BREAK_INTERVAL
        : this.STRETCH_BREAK_INTERVAL;

      currentTime = new Date(currentTime.getTime() + interval * 60 * 1000);

      if (currentTime > now && currentTime < endTime) {
        await this.scheduleBreakNotification(currentTime, breakType);
      }

      breakCount++;
    }

    // Schedule an eye break every 20 minutes (20-20-20 rule)
    await this.scheduleEyeBreaks(workStart, workEnd);
  }

  /**
   * Schedule eye break reminders (20-20-20 rule: every 20 min, look 20 feet away for 20 sec)
   */
  private async scheduleEyeBreaks(
    workStart: {hours: number; minutes: number},
    workEnd: {hours: number; minutes: number},
  ) {
    let currentTime = new Date();
    currentTime.setHours(workStart.hours, workStart.minutes, 0, 0);

    const endTime = new Date();
    endTime.setHours(workEnd.hours, workEnd.minutes, 0, 0);

    const now = new Date();

    while (currentTime < endTime) {
      currentTime = new Date(currentTime.getTime() + 20 * 60 * 1000);

      if (currentTime > now && currentTime < endTime) {
        await this.scheduleBreakNotification(currentTime, 'eye');
      }
    }
  }

  /**
   * Schedule a single break notification
   */
  private async scheduleBreakNotification(
    time: Date,
    type: 'micro' | 'stretch' | 'eye',
  ) {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: time.getTime(),
    };

    const titles = {
      micro: '⏸️ Time for a Micro-Break!',
      stretch: '🧘 Stretch Break Time!',
      eye: '👀 Eye Break Reminder',
    };

    const bodies = {
      micro: 'Take 2-5 minutes to stand, walk, or rest your eyes.',
      stretch: 'Time for some guided stretches to prevent office syndrome!',
      eye: 'Follow the 20-20-20 rule: Look 20 feet away for 20 seconds.',
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        id: `break-${type}-${time.getTime()}`,
        title: titles[type],
        body: bodies[type],
        android: {
          channelId: 'break-reminders',
          pressAction: {
            id: 'default',
          },
          actions: [
            {
              title: '✓ Start Break',
              pressAction: {
                id: 'start-break',
              },
            },
            {
              title: 'Snooze 5 min',
              pressAction: {
                id: 'snooze',
              },
            },
          ],
        },
        ios: {
          categoryId: 'break-reminder',
        },
      },
      trigger,
    );

    // Save reminder to local state
    const reminder: BreakReminder = {
      id: notificationId,
      scheduledTime: time,
      type,
      completed: false,
    };

    this.reminders.push(reminder);
    await this.saveReminders();
  }

  /**
   * Cancel all scheduled reminders
   */
  async cancelAllReminders() {
    await notifee.cancelAllNotifications();
    this.reminders = [];
    await this.saveReminders();
  }

  /**
   * Mark a break as completed and award points
   */
  async completeBreak(reminderId: string): Promise<number> {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) {
      return 0;
    }

    reminder.completed = true;

    // Award points based on break type
    const points = {
      micro: 10,
      stretch: 25,
      eye: 5,
    }[reminder.type];

    reminder.points = points;
    await this.saveReminders();

    return points;
  }

  /**
   * Snooze a break reminder by 5 minutes
   */
  async snoozeBreak(reminderId: string) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) {
      return;
    }

    const newTime = new Date(Date.now() + 5 * 60 * 1000);
    await this.scheduleBreakNotification(newTime, reminder.type);

    // Cancel the original
    await notifee.cancelNotification(reminderId);
  }

  /**
   * Get upcoming break reminders
   */
  getUpcomingBreaks(): BreakReminder[] {
    const now = new Date();
    return this.reminders
      .filter(r => r.scheduledTime > now && !r.completed)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Get next break time
   */
  getNextBreak(): BreakReminder | null {
    const upcoming = this.getUpcomingBreaks();
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  private parseTime(timeString: string): {hours: number; minutes: number} {
    const [hours, minutes] = timeString.split(':').map(Number);
    return {hours, minutes};
  }

  private async saveReminders() {
    await AsyncStorage.setItem('reminders', JSON.stringify(this.reminders));
  }

  private async loadReminders() {
    const data = await AsyncStorage.getItem('reminders');
    if (data) {
      this.reminders = JSON.parse(data);
    }
  }
}

export default BreakReminderService.getInstance();
