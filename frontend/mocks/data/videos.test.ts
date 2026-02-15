import { describe, it, expect } from 'vitest';
import {
  mockVideos,
  getVideoById,
  getVideosByTag,
  formatDuration
} from './videos';

describe('Mock Videos Data', () => {
  describe('mockVideos', () => {
    it('should have sample videos', () => {
      expect(mockVideos.length).toBeGreaterThan(0);
    });

    it('should have required fields for each video', () => {
      mockVideos.forEach(video => {
        expect(video).toHaveProperty('id');
        expect(video).toHaveProperty('title');
        expect(video).toHaveProperty('speaker');
        expect(video).toHaveProperty('duration');
        expect(video).toHaveProperty('tags');
      });
    });

    it('should have valid duration values', () => {
      mockVideos.forEach(video => {
        expect(video.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('getVideoById', () => {
    it('should return video when ID exists', () => {
      const video = getVideoById('video-001');
      expect(video).toBeDefined();
      expect(video?.title).toBe('The Future of Artificial Intelligence');
    });

    it('should return undefined for non-existent ID', () => {
      const video = getVideoById('non-existent');
      expect(video).toBeUndefined();
    });
  });

  describe('getVideosByTag', () => {
    it('should return videos with matching tag', () => {
      const techVideos = getVideosByTag('Technology');
      expect(techVideos.length).toBeGreaterThan(0);
      techVideos.forEach(video => {
        expect(video.tags).toContain('Technology');
      });
    });

    it('should return empty array for non-existent tag', () => {
      const videos = getVideosByTag('NonExistentTag');
      expect(videos).toEqual([]);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3600)).toBe('60:00');
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(90)).toBe('1:30');
    });
  });
});
