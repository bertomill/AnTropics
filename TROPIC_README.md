# Tropic - Wellness & Burnout Prevention App

Tropic is a comprehensive React Native mobile application designed to prevent burnout and office syndrome through science-based wellness interventions.

## Features

### 1. Break Reminders with Ultradian Rhythms
- Smart scheduling based on 90-minute ultradian cycles
- Micro-breaks every 30 minutes
- Stretch breaks every 60 minutes
- Eye breaks every 20 minutes (20-20-20 rule)
- Respects work hours and weekend settings
- Push notifications with snooze functionality

### 2. Guided Stretching Exercises
- 10 professionally designed exercises targeting:
  - Neck and shoulders
  - Upper and lower back
  - Wrists and hands
  - Eyes and vision
  - Overall posture
- Step-by-step instructions
- Timed exercises with progress tracking
- Points system for gamification

### 3. AI Companion (Claude)
- 24/7 emotional support and wellness coaching
- Stress level detection and analysis
- Personalized exercise recommendations
- Context-aware conversations
- Persistent chat history

### 4. Virtual Pet System
- Plant-based companion that grows with your wellness habits
- Health and happiness metrics
- Feed and play interactions
- Visual feedback based on your activity
- Motivation through emotional attachment

### 5. Gamification & Progress Tracking
- Points for completing exercises
- Daily streak tracking
- Level progression system
- Achievement badges
- Detailed statistics and history
- Weekly and monthly insights

## Tech Stack

- **Framework**: React Native 0.82
- **Navigation**: React Navigation (Bottom Tabs)
- **AI**: Anthropic Claude API
- **Notifications**: Notifee
- **Storage**: AsyncStorage
- **Camera** (Future): React Native Vision Camera
- **Animations** (Future): Lottie React Native

## Setup Instructions

### Prerequisites
- Node.js >= 20.19.4
- iOS: Xcode and CocoaPods
- Android: Android Studio and SDK

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **iOS Setup**
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

3. **Configure API Key**
   - Get your Anthropic API key from https://console.anthropic.com/
   - Create a `.env` file in the root directory:
     ```
     ANTHROPIC_API_KEY=your-api-key-here
     ```
   - Or update the API key in `src/screens/CompanionScreen.tsx`

4. **Run the app**

   For iOS:
   ```bash
   npx react-native run-ios
   ```

   For Android:
   ```bash
   npx react-native run-android
   ```

## Project Structure

```
Tropic/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── BreakScreen.tsx
│   │   ├── CompanionScreen.tsx
│   │   ├── PetScreen.tsx
│   │   └── StatsScreen.tsx
│   ├── services/         # Business logic services
│   │   ├── BreakReminderService.ts
│   │   └── AICompanionService.ts
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── components/       # Reusable components
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── exercises.ts
│   └── assets/          # Images and animations
├── App.tsx              # Root component
└── package.json
```

## Key Services

### BreakReminderService
Manages intelligent break scheduling based on:
- Ultradian rhythm principles (90-120 min cycles)
- User work hours and preferences
- Calendar conflicts (future feature)
- Break type rotation (micro, stretch, eye)

### AICompanionService
Provides emotional support through:
- Claude AI integration
- Conversation history management
- Stress level analysis
- Personalized recommendations
- Context-aware responses

## Roadmap

### Phase 1 (Current)
- ✅ Break reminder system
- ✅ Exercise library with instructions
- ✅ AI companion chat
- ✅ Virtual pet system
- ✅ Points and gamification
- ✅ Progress tracking

### Phase 2 (Next)
- [ ] Posture detection with camera
- [ ] Real-time form correction for exercises
- [ ] Animated exercise demonstrations
- [ ] Calendar integration
- [ ] Health app integration (Apple Health, Google Fit)
- [ ] Social features (share progress, challenges)

### Phase 3 (Future)
- [ ] Desktop companion app (Electron)
- [ ] Team/organization features
- [ ] Advanced analytics and insights
- [ ] Custom exercise creation
- [ ] Meditation and breathing exercises
- [ ] Sleep tracking integration

## Contributing

This is Berto's version of Tropic. For collaboration:
1. Create your own branch: `dev/your-name-tropic`
2. Or fork the repository
3. Implement your unique features
4. Share and compare implementations!

## License

Private project - All rights reserved

## Support

For issues or questions about this implementation, contact Berto.

---

**Built with ❤️ to prevent burnout and promote wellness**
