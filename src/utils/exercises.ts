import {Exercise} from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'neck-roll',
    name: 'Neck Rolls',
    description: 'Gentle circular neck movements to release tension',
    duration: 30,
    targetArea: 'neck',
    points: 15,
    instructions: [
      'Sit up straight with shoulders relaxed',
      'Slowly roll your head in a circular motion',
      'Complete 5 circles clockwise',
      'Reverse direction for 5 circles counterclockwise',
      'Keep movements slow and controlled',
    ],
  },
  {
    id: 'shoulder-shrug',
    name: 'Shoulder Shrugs',
    description: 'Release shoulder tension from computer work',
    duration: 20,
    targetArea: 'shoulders',
    points: 10,
    instructions: [
      'Stand or sit with arms at your sides',
      'Raise both shoulders up toward your ears',
      'Hold for 3 seconds',
      'Release and push shoulders down',
      'Repeat 10 times',
    ],
  },
  {
    id: 'upper-back-stretch',
    name: 'Upper Back Stretch',
    description: 'Stretch the upper back and shoulders',
    duration: 30,
    targetArea: 'back',
    points: 15,
    instructions: [
      'Sit or stand up straight',
      'Interlace fingers and push hands away from body',
      'Round your upper back and drop your head forward',
      'Feel the stretch between shoulder blades',
      'Hold for 20-30 seconds',
      'Release and repeat',
    ],
  },
  {
    id: 'wrist-circles',
    name: 'Wrist Circles',
    description: 'Prevent repetitive strain injury from typing',
    duration: 20,
    targetArea: 'wrists',
    points: 10,
    instructions: [
      'Extend arms in front of you',
      'Make fists with both hands',
      'Rotate wrists in circles 10 times clockwise',
      'Reverse direction for 10 circles counterclockwise',
      'Shake out hands when finished',
    ],
  },
  {
    id: 'eye-palming',
    name: 'Eye Palming',
    description: 'Relax tired eyes from screen time',
    duration: 60,
    targetArea: 'eyes',
    points: 20,
    instructions: [
      'Rub palms together vigorously to warm them',
      'Close your eyes',
      'Cup warm palms over closed eyes without pressing',
      'Relax and breathe deeply',
      'Visualize darkness and let eyes rest',
      'Continue for 30-60 seconds',
    ],
  },
  {
    id: 'eye-focus',
    name: '20-20-20 Eye Exercise',
    description: 'Reduce eye strain using the 20-20-20 rule',
    duration: 20,
    targetArea: 'eyes',
    points: 10,
    instructions: [
      'Every 20 minutes, take a 20-second break',
      'Look at something 20 feet away',
      'Focus on a distant object',
      'Blink several times',
      'Return to your work',
    ],
  },
  {
    id: 'seated-spinal-twist',
    name: 'Seated Spinal Twist',
    description: 'Release lower back tension',
    duration: 40,
    targetArea: 'back',
    points: 20,
    instructions: [
      'Sit up straight in your chair',
      'Place right hand on back of chair',
      'Twist torso to the right, looking over right shoulder',
      'Hold for 15-20 seconds',
      'Return to center',
      'Repeat on the left side',
    ],
  },
  {
    id: 'standing-quad-stretch',
    name: 'Standing Quad Stretch',
    description: 'Stretch legs after prolonged sitting',
    duration: 30,
    targetArea: 'posture',
    points: 15,
    instructions: [
      'Stand near a wall or desk for balance',
      'Bend right knee and grab right ankle',
      'Pull heel toward buttock',
      'Keep knees together and hips forward',
      'Hold for 15 seconds',
      'Switch to left leg',
    ],
  },
  {
    id: 'chest-opener',
    name: 'Chest Opener',
    description: 'Counteract hunched posture from desk work',
    duration: 30,
    targetArea: 'posture',
    points: 15,
    instructions: [
      'Stand with feet hip-width apart',
      'Clasp hands behind your back',
      'Straighten arms and lift hands away from body',
      'Open chest and squeeze shoulder blades together',
      'Hold for 20-30 seconds',
      'Release and repeat',
    ],
  },
  {
    id: 'cat-cow-seated',
    name: 'Seated Cat-Cow',
    description: 'Improve spinal flexibility and posture',
    duration: 40,
    targetArea: 'back',
    points: 20,
    instructions: [
      'Sit at the edge of your chair',
      'Place hands on knees',
      'Inhale: arch back, lift chest, look up (cow pose)',
      'Exhale: round spine, drop head forward (cat pose)',
      'Continue flowing between poses',
      'Repeat 10 times',
    ],
  },
];

/**
 * Get exercises by target area
 */
export function getExercisesByArea(
  area: Exercise['targetArea'],
): Exercise[] {
  return EXERCISES.filter(ex => ex.targetArea === area);
}

/**
 * Get random exercise
 */
export function getRandomExercise(): Exercise {
  return EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
}

/**
 * Get recommended exercise based on time since last break
 */
export function getRecommendedExercise(minutesSinceBreak: number): Exercise {
  if (minutesSinceBreak > 90) {
    // Long time without break - full body stretch
    return EXERCISES.find(ex => ex.id === 'cat-cow-seated') || EXERCISES[0];
  } else if (minutesSinceBreak > 60) {
    // Moderate time - upper body focus
    return EXERCISES.find(ex => ex.id === 'upper-back-stretch') || EXERCISES[0];
  } else if (minutesSinceBreak > 20) {
    // Eye strain focus
    return EXERCISES.find(ex => ex.id === 'eye-focus') || EXERCISES[0];
  } else {
    // Quick refresh
    return EXERCISES.find(ex => ex.id === 'neck-roll') || EXERCISES[0];
  }
}
