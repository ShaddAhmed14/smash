/**
 * Transcript parsing utilities for SRT format.
 * Extracted from Transcript.js for testability.
 */

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

/**
 * Converts SRT timestamp to seconds.
 * Format: HH:MM:SS,mmm (e.g., "00:01:23,456")
 *
 * @param timeStr - SRT format timestamp
 * @returns Time in seconds
 */
export function timeToSeconds(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') {
    return 0;
  }

  const [time, ms] = timeStr.split(',');
  const parts = time.split(':');

  if (parts.length !== 3) {
    return 0;
  }

  const [hours, minutes, seconds] = parts.map(Number);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }

  const milliseconds = ms ? parseInt(ms, 10) : 0;

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Formats seconds to MM:SS display format.
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses SRT content into structured segments.
 *
 * SRT format:
 * 1
 * 00:00:00,000 --> 00:00:05,000
 * Text content here
 *
 * @param srtContent - Raw SRT file content
 * @returns Array of parsed segments
 */
export function parseSRT(srtContent: string): TranscriptSegment[] {
  if (!srtContent || typeof srtContent !== 'string') {
    return [];
  }

  const segments = srtContent.trim().split('\n\n');

  return segments
    .map((segment) => {
      const lines = segment.split('\n');

      // Need at least 3 lines: id, timestamp, text
      if (lines.length < 3) {
        return null;
      }

      const id = parseInt(lines[0], 10);
      const timeRange = lines[1];

      if (!timeRange || !timeRange.includes(' --> ')) {
        return null;
      }

      const [startTime, endTime] = timeRange.split(' --> ');

      return {
        id,
        start: timeToSeconds(startTime),
        end: timeToSeconds(endTime),
        text: lines.slice(2).join(' '),
      };
    })
    .filter((segment): segment is TranscriptSegment => segment !== null);
}

/**
 * Finds the active segment based on current playback time.
 *
 * @param segments - Parsed transcript segments
 * @param currentTime - Current video playback time in seconds
 * @returns Active segment or null if none found
 */
export function findActiveSegment(
  segments: TranscriptSegment[],
  currentTime: number
): TranscriptSegment | null {
  if (!segments || segments.length === 0) {
    return null;
  }

  // Handle time past the last segment - return last segment
  const lastSegment = segments[segments.length - 1];
  if (currentTime >= lastSegment.end) {
    return lastSegment;
  }

  // Find segment where currentTime falls within start-end range
  return (
    segments.find(
      (segment) => currentTime >= segment.start && currentTime < segment.end
    ) || null
  );
}
