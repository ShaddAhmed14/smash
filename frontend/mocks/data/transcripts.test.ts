import { describe, it, expect } from 'vitest';
import {
  mockTranscriptAI,
  getTranscriptByVideoId,
  getSegmentAtTime,
  searchTranscript
} from './transcripts';

describe('Mock Transcripts Data', () => {
  describe('mockTranscriptAI', () => {
    it('should have segments', () => {
      expect(mockTranscriptAI.segments.length).toBeGreaterThan(0);
    });

    it('should have valid segment structure', () => {
      mockTranscriptAI.segments.forEach(segment => {
        expect(segment).toHaveProperty('id');
        expect(segment).toHaveProperty('startTime');
        expect(segment).toHaveProperty('endTime');
        expect(segment).toHaveProperty('text');
        expect(segment.endTime).toBeGreaterThan(segment.startTime);
      });
    });

    it('should have non-overlapping segments', () => {
      const segments = mockTranscriptAI.segments;
      for (let i = 1; i < segments.length; i++) {
        expect(segments[i].startTime).toBeGreaterThanOrEqual(segments[i - 1].endTime);
      }
    });
  });

  describe('getTranscriptByVideoId', () => {
    it('should return transcript for valid video ID', () => {
      const transcript = getTranscriptByVideoId('video-001');
      expect(transcript).toBeDefined();
      expect(transcript?.videoId).toBe('video-001');
    });

    it('should return undefined for invalid video ID', () => {
      const transcript = getTranscriptByVideoId('invalid');
      expect(transcript).toBeUndefined();
    });
  });

  describe('getSegmentAtTime', () => {
    it('should return correct segment for given time', () => {
      const segment = getSegmentAtTime(mockTranscriptAI, 5);
      expect(segment).toBeDefined();
      expect(segment?.startTime).toBeLessThanOrEqual(5);
      expect(segment?.endTime).toBeGreaterThan(5);
    });

    it('should return undefined for time outside all segments', () => {
      const segment = getSegmentAtTime(mockTranscriptAI, 99999);
      expect(segment).toBeUndefined();
    });
  });

  describe('searchTranscript', () => {
    it('should find segments containing search term', () => {
      const results = searchTranscript(mockTranscriptAI, 'AI');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(segment => {
        expect(segment.text.toLowerCase()).toContain('ai');
      });
    });

    it('should be case-insensitive', () => {
      const upper = searchTranscript(mockTranscriptAI, 'ARTIFICIAL');
      const lower = searchTranscript(mockTranscriptAI, 'artificial');
      expect(upper.length).toBe(lower.length);
    });

    it('should return empty array when no matches', () => {
      const results = searchTranscript(mockTranscriptAI, 'xyz123nonexistent');
      expect(results).toEqual([]);
    });
  });
});
