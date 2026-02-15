/**
 * Mock video data for testing and development
 * This provides sample data for users who want to test the app without real videos
 */

export interface MockVideo {
  id: string;
  title: string;
  speaker: string;
  duration: number; // in seconds
  thumbnail: string;
  uploadDate: string;
  tags: string[];
  description: string;
}

export const mockVideos: MockVideo[] = [
  {
    id: 'video-001',
    title: 'The Future of Artificial Intelligence',
    speaker: 'Dr. Sarah Chen',
    duration: 1080, // 18 minutes
    thumbnail: '/mocks/thumbnails/ai-future.jpg',
    uploadDate: '2024-11-15',
    tags: ['AI', 'Technology', 'Future'],
    description: 'An exploration of how AI will shape our world in the coming decades.'
  },
  {
    id: 'video-002',
    title: 'Climate Action: What We Can Do Today',
    speaker: 'Prof. Michael Torres',
    duration: 924, // 15:24
    thumbnail: '/mocks/thumbnails/climate.jpg',
    uploadDate: '2024-10-28',
    tags: ['Climate', 'Sustainability', 'Action'],
    description: 'Practical steps individuals and communities can take to combat climate change.'
  },
  {
    id: 'video-003',
    title: 'The Art of Public Speaking',
    speaker: 'Amanda Williams',
    duration: 1260, // 21 minutes
    thumbnail: '/mocks/thumbnails/speaking.jpg',
    uploadDate: '2024-09-12',
    tags: ['Communication', 'Leadership', 'Skills'],
    description: 'Master the techniques that make great speakers memorable.'
  },
  {
    id: 'video-004',
    title: 'Innovation in Healthcare',
    speaker: 'Dr. James Park',
    duration: 1440, // 24 minutes
    thumbnail: '/mocks/thumbnails/healthcare.jpg',
    uploadDate: '2024-08-05',
    tags: ['Health', 'Innovation', 'Technology'],
    description: 'How new technologies are revolutionizing patient care and medical research.'
  },
  {
    id: 'video-005',
    title: 'Building Inclusive Communities',
    speaker: 'Maria Gonzalez',
    duration: 780, // 13 minutes
    thumbnail: '/mocks/thumbnails/community.jpg',
    uploadDate: '2024-07-20',
    tags: ['Society', 'Inclusion', 'Community'],
    description: 'Strategies for creating spaces where everyone belongs.'
  }
];

export const getVideoById = (id: string): MockVideo | undefined => {
  return mockVideos.find(v => v.id === id);
};

export const getVideosByTag = (tag: string): MockVideo[] => {
  return mockVideos.filter(v => v.tags.includes(tag));
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
