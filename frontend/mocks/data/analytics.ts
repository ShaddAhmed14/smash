/**
 * Mock analytics data for testing visualizations
 * Provides consistent sample data for all chart components
 */

// Seeded random generator for reproducible mock data
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate array of random values with seed
export const generateSeededArray = (length: number, seed: number, min = 0, max = 100): number[] => {
  return Array.from({ length }, (_, i) =>
    Math.floor(seededRandom(seed + i) * (max - min) + min)
  );
};

// ===== Analytics Page Data =====

export interface WeeklyActivity {
  week: string;
  videosProcessed: number;
  averageScore: number;
}

export const mockWeeklyActivity: WeeklyActivity[] = Array.from({ length: 52 }, (_, i) => ({
  week: `W${i + 1}`,
  videosProcessed: Math.floor(seededRandom(555 + i) * 80 + 20),
  averageScore: Math.floor(seededRandom(556 + i) * 30 + 60)
}));

export interface TopicFrequency {
  word: string;
  frequency: number;
  category: string;
}

export const mockTopicFrequencies: TopicFrequency[] = [
  { word: 'technology', frequency: 847, category: 'Tech' },
  { word: 'innovation', frequency: 623, category: 'Tech' },
  { word: 'AI', frequency: 789, category: 'Tech' },
  { word: 'climate', frequency: 512, category: 'Science' },
  { word: 'science', frequency: 445, category: 'Science' },
  { word: 'research', frequency: 278, category: 'Science' },
  { word: 'future', frequency: 698, category: 'Society' },
  { word: 'society', frequency: 478, category: 'Society' },
  { word: 'education', frequency: 334, category: 'Society' },
  { word: 'data', frequency: 567, category: 'Tech' },
  { word: 'health', frequency: 389, category: 'Health' },
  { word: 'creativity', frequency: 412, category: 'Business' },
  { word: 'leadership', frequency: 298, category: 'Business' },
  { word: 'sustainability', frequency: 367, category: 'Science' },
  { word: 'design', frequency: 323, category: 'Business' },
  { word: 'business', frequency: 489, category: 'Business' }
];

export interface CorrelationData {
  features: string[];
  matrix: number[][];
}

export const mockCorrelationData: CorrelationData = {
  features: ['Gesture', 'Prosody', 'Facial', 'Topic', 'Audio'],
  matrix: [
    [1.00, 0.72, 0.65, 0.45, 0.58],
    [0.72, 1.00, 0.68, 0.52, 0.81],
    [0.65, 0.68, 1.00, 0.41, 0.55],
    [0.45, 0.52, 0.41, 1.00, 0.38],
    [0.58, 0.81, 0.55, 0.38, 1.00]
  ]
};

// ===== Analysis Page Data =====

export interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
  label?: string;
}

export const generateClusterData = (
  numPoints: number,
  numClusters: number,
  seed: number
): ClusterPoint[] => {
  const centers = [
    { x: 20, y: 70 }, { x: 50, y: 25 }, { x: 80, y: 65 },
    { x: 25, y: 30 }, { x: 75, y: 25 }
  ].slice(0, numClusters);

  return Array.from({ length: numPoints }, (_, i) => {
    const cluster = Math.floor(seededRandom(seed + i) * numClusters);
    return {
      x: centers[cluster].x + (seededRandom(seed + i * 2) - 0.5) * 15,
      y: centers[cluster].y + (seededRandom(seed + i * 3) - 0.5) * 15,
      cluster
    };
  });
};

export interface HeatmapData {
  rows: string[];
  cols: string[];
  values: number[][];
}

export const mockGestureHeatmap: HeatmapData = {
  rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  cols: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  values: Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) =>
      Math.floor(seededRandom(333 + day * 100 + hour) * 100)
    )
  )
};

export interface AudioFeature {
  feature: string;
  value: number;
  maxValue: number;
}

export const mockAudioFeatures: AudioFeature[] = [
  { feature: 'Pitch Variation', value: 72, maxValue: 100 },
  { feature: 'Speaking Rate', value: 65, maxValue: 100 },
  { feature: 'Volume Range', value: 58, maxValue: 100 },
  { feature: 'Pause Pattern', value: 81, maxValue: 100 },
  { feature: 'Clarity', value: 77, maxValue: 100 },
  { feature: 'Emphasis', value: 69, maxValue: 100 }
];

// ===== Summary Statistics =====

export interface OverallStats {
  totalVideos: number;
  totalHours: number;
  averageScore: number;
  topSpeakers: number;
  uniqueTopics: number;
}

export const mockOverallStats: OverallStats = {
  totalVideos: 1247,
  totalHours: 892,
  averageScore: 78.5,
  topSpeakers: 156,
  uniqueTopics: 42
};
