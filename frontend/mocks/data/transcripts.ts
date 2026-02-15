/**
 * Mock transcript data for testing and development
 * Provides sample transcript segments for video playback testing
 */

export interface TranscriptSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface MockTranscript {
  videoId: string;
  language: string;
  segments: TranscriptSegment[];
}

// Sample transcript for video-001 (AI Future talk)
export const mockTranscriptAI: MockTranscript = {
  videoId: 'video-001',
  language: 'en',
  segments: [
    { id: 'seg-001', startTime: 0, endTime: 4.5, text: "Good morning everyone. Today I want to talk about something that affects all of us.", speaker: 'Dr. Sarah Chen', confidence: 0.98 },
    { id: 'seg-002', startTime: 4.5, endTime: 9.2, text: "Artificial intelligence is no longer a concept from science fiction.", speaker: 'Dr. Sarah Chen', confidence: 0.97 },
    { id: 'seg-003', startTime: 9.2, endTime: 14.8, text: "It's here, it's real, and it's transforming every aspect of our lives.", speaker: 'Dr. Sarah Chen', confidence: 0.96 },
    { id: 'seg-004', startTime: 14.8, endTime: 20.5, text: "From healthcare to transportation, from education to entertainment.", speaker: 'Dr. Sarah Chen', confidence: 0.98 },
    { id: 'seg-005', startTime: 20.5, endTime: 26.3, text: "Let me share with you three key insights about where AI is heading.", speaker: 'Dr. Sarah Chen', confidence: 0.95 },
    { id: 'seg-006', startTime: 26.3, endTime: 32.0, text: "First, AI will become increasingly personalized to individual needs.", speaker: 'Dr. Sarah Chen', confidence: 0.97 },
    { id: 'seg-007', startTime: 32.0, endTime: 38.5, text: "Imagine a world where your digital assistant truly understands you.", speaker: 'Dr. Sarah Chen', confidence: 0.94 },
    { id: 'seg-008', startTime: 38.5, endTime: 45.2, text: "Not just your words, but your context, your emotions, your intentions.", speaker: 'Dr. Sarah Chen', confidence: 0.96 },
    { id: 'seg-009', startTime: 45.2, endTime: 51.8, text: "Second, collaboration between humans and AI will define success.", speaker: 'Dr. Sarah Chen', confidence: 0.98 },
    { id: 'seg-010', startTime: 51.8, endTime: 58.0, text: "The future isn't about AI replacing humans. It's about augmentation.", speaker: 'Dr. Sarah Chen', confidence: 0.97 },
  ]
};

// Sample transcript for video-002 (Climate talk)
export const mockTranscriptClimate: MockTranscript = {
  videoId: 'video-002',
  language: 'en',
  segments: [
    { id: 'seg-001', startTime: 0, endTime: 5.0, text: "Climate change is the defining challenge of our generation.", speaker: 'Prof. Michael Torres', confidence: 0.98 },
    { id: 'seg-002', startTime: 5.0, endTime: 10.5, text: "But here's what gives me hope: we have the solutions.", speaker: 'Prof. Michael Torres', confidence: 0.97 },
    { id: 'seg-003', startTime: 10.5, endTime: 16.2, text: "Today I'll share practical actions that each of us can take.", speaker: 'Prof. Michael Torres', confidence: 0.96 },
    { id: 'seg-004', startTime: 16.2, endTime: 22.0, text: "Starting with the choices we make every single day.", speaker: 'Prof. Michael Torres', confidence: 0.98 },
    { id: 'seg-005', startTime: 22.0, endTime: 28.5, text: "Transportation accounts for nearly 30% of carbon emissions.", speaker: 'Prof. Michael Torres', confidence: 0.95 },
  ]
};

// Map of all transcripts by video ID
export const mockTranscripts: Record<string, MockTranscript> = {
  'video-001': mockTranscriptAI,
  'video-002': mockTranscriptClimate,
};

export const getTranscriptByVideoId = (videoId: string): MockTranscript | undefined => {
  return mockTranscripts[videoId];
};

export const getSegmentAtTime = (transcript: MockTranscript, time: number): TranscriptSegment | undefined => {
  return transcript.segments.find(s => time >= s.startTime && time < s.endTime);
};

export const searchTranscript = (transcript: MockTranscript, query: string): TranscriptSegment[] => {
  const lowerQuery = query.toLowerCase();
  return transcript.segments.filter(s => s.text.toLowerCase().includes(lowerQuery));
};
