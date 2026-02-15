import { describe, it, expect } from 'vitest';
import {
  seededRandom,
  generateSeededArray,
  generateClusterData,
  mockWeeklyActivity,
  mockTopicFrequencies,
  mockCorrelationData,
  mockOverallStats
} from './analytics';

describe('Analytics Mock Data', () => {
  describe('seededRandom', () => {
    it('should produce consistent results for same seed', () => {
      const result1 = seededRandom(42);
      const result2 = seededRandom(42);
      expect(result1).toBe(result2);
    });

    it('should produce different results for different seeds', () => {
      const result1 = seededRandom(42);
      const result2 = seededRandom(43);
      expect(result1).not.toBe(result2);
    });

    it('should return values between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const val = seededRandom(i);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('generateSeededArray', () => {
    it('should generate array of specified length', () => {
      const arr = generateSeededArray(10, 123);
      expect(arr.length).toBe(10);
    });

    it('should produce consistent results', () => {
      const arr1 = generateSeededArray(5, 456);
      const arr2 = generateSeededArray(5, 456);
      expect(arr1).toEqual(arr2);
    });

    it('should respect min and max bounds', () => {
      const arr = generateSeededArray(100, 789, 50, 75);
      arr.forEach(val => {
        expect(val).toBeGreaterThanOrEqual(50);
        expect(val).toBeLessThan(75);
      });
    });
  });

  describe('generateClusterData', () => {
    it('should generate correct number of points', () => {
      const data = generateClusterData(100, 5, 42);
      expect(data.length).toBe(100);
    });

    it('should assign clusters within range', () => {
      const numClusters = 5;
      const data = generateClusterData(100, numClusters, 42);
      data.forEach(point => {
        expect(point.cluster).toBeGreaterThanOrEqual(0);
        expect(point.cluster).toBeLessThan(numClusters);
      });
    });

    it('should produce consistent results', () => {
      const data1 = generateClusterData(50, 3, 999);
      const data2 = generateClusterData(50, 3, 999);
      expect(data1).toEqual(data2);
    });
  });

  describe('mockWeeklyActivity', () => {
    it('should have 52 weeks', () => {
      expect(mockWeeklyActivity.length).toBe(52);
    });

    it('should have valid activity data', () => {
      mockWeeklyActivity.forEach(week => {
        expect(week.videosProcessed).toBeGreaterThan(0);
        expect(week.averageScore).toBeGreaterThan(0);
        expect(week.averageScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('mockTopicFrequencies', () => {
    it('should have topics with frequencies', () => {
      expect(mockTopicFrequencies.length).toBeGreaterThan(0);
      mockTopicFrequencies.forEach(topic => {
        expect(topic.word.length).toBeGreaterThan(0);
        expect(topic.frequency).toBeGreaterThan(0);
        expect(topic.category).toBeDefined();
      });
    });
  });

  describe('mockCorrelationData', () => {
    it('should have symmetric matrix', () => {
      const { matrix, features } = mockCorrelationData;
      expect(matrix.length).toBe(features.length);

      for (let i = 0; i < matrix.length; i++) {
        expect(matrix[i].length).toBe(features.length);
        expect(matrix[i][i]).toBe(1); // Diagonal should be 1
      }
    });

    it('should have correlation values between 0 and 1', () => {
      mockCorrelationData.matrix.forEach(row => {
        row.forEach(val => {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('mockOverallStats', () => {
    it('should have positive values', () => {
      expect(mockOverallStats.totalVideos).toBeGreaterThan(0);
      expect(mockOverallStats.totalHours).toBeGreaterThan(0);
      expect(mockOverallStats.averageScore).toBeGreaterThan(0);
      expect(mockOverallStats.topSpeakers).toBeGreaterThan(0);
      expect(mockOverallStats.uniqueTopics).toBeGreaterThan(0);
    });
  });
});
