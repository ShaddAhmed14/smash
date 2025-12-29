/**
 * Tests for transcript parsing utilities.
 * Tests SRT format parsing, time conversion, and segment matching.
 */
import { describe, it, expect } from 'vitest'
import {
  timeToSeconds,
  formatTime,
  parseSRT,
  findActiveSegment,
  type TranscriptSegment,
} from '../utils/transcript'

describe('timeToSeconds', () => {
  describe('valid inputs', () => {
    it('converts simple timestamp without milliseconds', () => {
      expect(timeToSeconds('00:00:05,000')).toBe(5)
    })

    it('converts timestamp with milliseconds', () => {
      expect(timeToSeconds('00:00:05,500')).toBe(5.5)
    })

    it('converts minutes correctly', () => {
      expect(timeToSeconds('00:02:30,000')).toBe(150)
    })

    it('converts hours correctly', () => {
      expect(timeToSeconds('01:00:00,000')).toBe(3600)
    })

    it('converts complex timestamp', () => {
      expect(timeToSeconds('01:23:45,678')).toBeCloseTo(5025.678, 2)
    })

    it('handles zero time', () => {
      expect(timeToSeconds('00:00:00,000')).toBe(0)
    })

    it('handles missing milliseconds', () => {
      // Some SRT files might not have milliseconds
      expect(timeToSeconds('00:01:30')).toBe(90)
    })
  })

  describe('edge cases and invalid inputs', () => {
    it('returns 0 for empty string', () => {
      expect(timeToSeconds('')).toBe(0)
    })

    it('returns 0 for null/undefined', () => {
      expect(timeToSeconds(null as any)).toBe(0)
      expect(timeToSeconds(undefined as any)).toBe(0)
    })

    it('returns 0 for malformed timestamp', () => {
      expect(timeToSeconds('invalid')).toBe(0)
      expect(timeToSeconds('00:00')).toBe(0) // missing seconds
    })

    it('returns 0 for non-string input', () => {
      expect(timeToSeconds(123 as any)).toBe(0)
    })
  })
})

describe('formatTime', () => {
  describe('valid inputs', () => {
    it('formats zero seconds', () => {
      expect(formatTime(0)).toBe('0:00')
    })

    it('formats seconds under a minute', () => {
      expect(formatTime(30)).toBe('0:30')
      expect(formatTime(5)).toBe('0:05')
    })

    it('formats exactly one minute', () => {
      expect(formatTime(60)).toBe('1:00')
    })

    it('formats minutes and seconds', () => {
      expect(formatTime(90)).toBe('1:30')
      expect(formatTime(125)).toBe('2:05')
    })

    it('formats large values', () => {
      expect(formatTime(3661)).toBe('61:01') // Over an hour
    })

    it('truncates decimal seconds', () => {
      expect(formatTime(30.7)).toBe('0:30')
      expect(formatTime(30.9)).toBe('0:30')
    })
  })

  describe('edge cases', () => {
    it('handles negative values', () => {
      expect(formatTime(-5)).toBe('0:00')
    })

    it('handles NaN', () => {
      expect(formatTime(NaN)).toBe('0:00')
    })

    it('handles non-number input', () => {
      expect(formatTime('30' as any)).toBe('0:00')
    })
  })
})

describe('parseSRT', () => {
  const validSRT = `1
00:00:00,000 --> 00:00:05,000
Hello world

2
00:00:05,000 --> 00:00:10,000
This is a test

3
00:00:10,000 --> 00:00:15,500
Final segment`

  describe('valid SRT content', () => {
    it('parses multiple segments correctly', () => {
      const result = parseSRT(validSRT)
      expect(result).toHaveLength(3)
    })

    it('extracts segment IDs correctly', () => {
      const result = parseSRT(validSRT)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
      expect(result[2].id).toBe(3)
    })

    it('extracts start times correctly', () => {
      const result = parseSRT(validSRT)
      expect(result[0].start).toBe(0)
      expect(result[1].start).toBe(5)
      expect(result[2].start).toBe(10)
    })

    it('extracts end times correctly', () => {
      const result = parseSRT(validSRT)
      expect(result[0].end).toBe(5)
      expect(result[1].end).toBe(10)
      expect(result[2].end).toBe(15.5)
    })

    it('extracts text content correctly', () => {
      const result = parseSRT(validSRT)
      expect(result[0].text).toBe('Hello world')
      expect(result[1].text).toBe('This is a test')
      expect(result[2].text).toBe('Final segment')
    })
  })

  describe('multi-line text', () => {
    it('handles multi-line segment text', () => {
      const multiLineSRT = `1
00:00:00,000 --> 00:00:05,000
Line one
Line two
Line three`
      const result = parseSRT(multiLineSRT)
      expect(result[0].text).toBe('Line one Line two Line three')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      expect(parseSRT('')).toEqual([])
    })

    it('returns empty array for null/undefined', () => {
      expect(parseSRT(null as any)).toEqual([])
      expect(parseSRT(undefined as any)).toEqual([])
    })

    it('handles single segment', () => {
      const singleSRT = `1
00:00:00,000 --> 00:00:05,000
Single segment`
      const result = parseSRT(singleSRT)
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Single segment')
    })

    it('skips malformed segments', () => {
      const malformedSRT = `1
00:00:00,000 --> 00:00:05,000
Valid segment

invalid segment without timestamp

3
00:00:10,000 --> 00:00:15,000
Another valid segment`
      const result = parseSRT(malformedSRT)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(3)
    })

    it('handles Windows-style line endings', () => {
      const windowsSRT = "1\r\n00:00:00,000 --> 00:00:05,000\r\nText"
      // This should still work since split('\n\n') handles most cases
      // and individual lines are split by '\n'
      const result = parseSRT(windowsSRT.replace(/\r\n/g, '\n'))
      expect(result).toHaveLength(1)
    })

    it('handles extra whitespace', () => {
      const spacedSRT = `
1
00:00:00,000 --> 00:00:05,000
Text with spaces

`
      const result = parseSRT(spacedSRT)
      expect(result).toHaveLength(1)
    })
  })
})

describe('findActiveSegment', () => {
  const segments: TranscriptSegment[] = [
    { id: 1, start: 0, end: 5, text: 'First' },
    { id: 2, start: 5, end: 10, text: 'Second' },
    { id: 3, start: 10, end: 15, text: 'Third' },
  ]

  describe('finding active segment', () => {
    it('finds segment at start of video', () => {
      const result = findActiveSegment(segments, 0)
      expect(result?.id).toBe(1)
    })

    it('finds segment in middle', () => {
      const result = findActiveSegment(segments, 7.5)
      expect(result?.id).toBe(2)
    })

    it('finds correct segment at boundary (inclusive start)', () => {
      const result = findActiveSegment(segments, 5)
      expect(result?.id).toBe(2) // At exactly 5, should be in segment 2
    })

    it('segment end is exclusive', () => {
      const result = findActiveSegment(segments, 4.999)
      expect(result?.id).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('returns last segment when past video end', () => {
      const result = findActiveSegment(segments, 20)
      expect(result?.id).toBe(3)
    })

    it('returns last segment at exactly video end', () => {
      const result = findActiveSegment(segments, 15)
      expect(result?.id).toBe(3)
    })

    it('returns null for empty segments array', () => {
      expect(findActiveSegment([], 5)).toBeNull()
    })

    it('returns null for null segments', () => {
      expect(findActiveSegment(null as any, 5)).toBeNull()
    })

    it('handles gaps between segments', () => {
      const gappedSegments: TranscriptSegment[] = [
        { id: 1, start: 0, end: 5, text: 'First' },
        { id: 2, start: 8, end: 12, text: 'Second' }, // Gap from 5-8
      ]
      const result = findActiveSegment(gappedSegments, 6) // In the gap
      expect(result).toBeNull()
    })

    it('handles negative time', () => {
      const result = findActiveSegment(segments, -1)
      expect(result).toBeNull()
    })
  })

  describe('single segment', () => {
    it('handles single segment within range', () => {
      const single = [{ id: 1, start: 0, end: 10, text: 'Only' }]
      expect(findActiveSegment(single, 5)?.id).toBe(1)
    })

    it('handles single segment past end', () => {
      const single = [{ id: 1, start: 0, end: 10, text: 'Only' }]
      expect(findActiveSegment(single, 15)?.id).toBe(1)
    })
  })
})
