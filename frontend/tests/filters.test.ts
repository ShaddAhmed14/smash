/**
 * Tests for video filtering logic in VideoLibraryPage.
 * Tests the filter combination logic, selection management, and validation.
 */
import { describe, it, expect } from 'vitest'
import {
  filterVideos,
  toggleVideoSelection,
  selectAllVideos,
  isValidSelection,
  DEFAULT_FILTERS,
  MAX_SELECTION,
  type VideoMetadata,
  type FilterState,
} from '../utils/filters'

// Sample test data
const sampleVideos: VideoMetadata[] = [
  {
    video_id: 'vid1',
    video_name: 'TED Talk 1',
    year: 2023,
    language: 'English',
    speaker_gender: 'Male',
    topics: ['Science', 'Technology'],
    duration: 15,
    speaker_name: 'John Doe',
  },
  {
    video_id: 'vid2',
    video_name: 'TED Talk 2',
    year: 2023,
    language: 'Spanish',
    speaker_gender: 'Female',
    topics: ['Art', 'Culture'],
    duration: 12,
    speaker_name: 'Jane Smith',
  },
  {
    video_id: 'vid3',
    video_name: 'TED Talk 3',
    year: 2024,
    language: 'English',
    speaker_gender: 'Female',
    topics: ['Science', 'Health'],
    duration: 18,
    speaker_name: 'Alice Johnson',
  },
  {
    video_id: 'vid4',
    video_name: 'TED Talk 4',
    year: 2024,
    language: 'German',
    speaker_gender: 'Male',
    topics: ['Technology', 'Business'],
    duration: 20,
    speaker_name: 'Bob Williams',
  },
  {
    video_id: 'vid5',
    video_name: 'TED Talk 5',
    year: 2022,
    language: 'English',
    speaker_gender: 'Male',
    topics: ['Science'],
    duration: 10,
    speaker_name: 'Charlie Brown',
  },
]

describe('filterVideos', () => {
  describe('default filters (all)', () => {
    it('returns all videos when all filters are default', () => {
      const result = filterVideos(sampleVideos, DEFAULT_FILTERS)
      expect(result).toHaveLength(5)
    })

    it('returns empty array for empty input', () => {
      const result = filterVideos([], DEFAULT_FILTERS)
      expect(result).toHaveLength(0)
    })

    it('handles null/undefined input gracefully', () => {
      const result = filterVideos(null as any, DEFAULT_FILTERS)
      expect(result).toHaveLength(0)
    })
  })

  describe('single filter', () => {
    it('filters by year correctly', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, year: '2023' }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(2)
      expect(result.every((v) => v.year === 2023)).toBe(true)
    })

    it('filters by language correctly', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, language: 'English' }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(3)
      expect(result.every((v) => v.language === 'English')).toBe(true)
    })

    it('filters by gender correctly', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, gender: 'Female' }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(2)
      expect(result.every((v) => v.speaker_gender === 'Female')).toBe(true)
    })

    it('filters by topic correctly (checks array inclusion)', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, topic: 'Science' }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(3)
      expect(result.every((v) => v.topics.includes('Science'))).toBe(true)
    })

    it('returns empty when filter matches nothing', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, year: '1999' }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(0)
    })
  })

  describe('combined filters (AND logic)', () => {
    it('combines year and language filters', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTERS,
        year: '2023',
        language: 'English',
      }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(1)
      expect(result[0].video_id).toBe('vid1')
    })

    it('combines year, language, and gender filters', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTERS,
        year: '2024',
        language: 'English',
        gender: 'Female',
      }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(1)
      expect(result[0].video_id).toBe('vid3')
    })

    it('combines all four filters', () => {
      const filters: FilterState = {
        year: '2023',
        language: 'English',
        gender: 'Male',
        topic: 'Science',
      }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(1)
      expect(result[0].video_id).toBe('vid1')
    })

    it('returns empty when combined filters have no match', () => {
      const filters: FilterState = {
        year: '2023',
        language: 'German', // No German videos in 2023
        gender: 'All Genders',
        topic: 'All Topics',
      }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(0)
    })
  })

  describe('topic filter edge cases', () => {
    it('matches videos with multiple topics', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, topic: 'Technology' }
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(2)
      expect(result.map((v) => v.video_id)).toContain('vid1')
      expect(result.map((v) => v.video_id)).toContain('vid4')
    })

    it('does not partial match topics', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, topic: 'Tech' } // partial
      const result = filterVideos(sampleVideos, filters)
      expect(result).toHaveLength(0)
    })
  })
})

describe('toggleVideoSelection', () => {
  it('adds video to empty selection', () => {
    const result = toggleVideoSelection([], 'vid1')
    expect(result).toEqual(['vid1'])
  })

  it('adds video to existing selection', () => {
    const result = toggleVideoSelection(['vid1'], 'vid2')
    expect(result).toEqual(['vid1', 'vid2'])
  })

  it('removes video from selection when already selected', () => {
    const result = toggleVideoSelection(['vid1', 'vid2'], 'vid1')
    expect(result).toEqual(['vid2'])
  })

  it('removes last video from selection', () => {
    const result = toggleVideoSelection(['vid1'], 'vid1')
    expect(result).toEqual([])
  })

  it('does not mutate original array', () => {
    const original = ['vid1', 'vid2']
    const result = toggleVideoSelection(original, 'vid3')
    expect(original).toEqual(['vid1', 'vid2'])
    expect(result).toEqual(['vid1', 'vid2', 'vid3'])
  })
})

describe('selectAllVideos', () => {
  it('returns all video IDs from filtered list', () => {
    const result = selectAllVideos(sampleVideos)
    expect(result).toEqual(['vid1', 'vid2', 'vid3', 'vid4', 'vid5'])
  })

  it('returns empty array for empty input', () => {
    const result = selectAllVideos([])
    expect(result).toEqual([])
  })

  it('works with filtered subset', () => {
    const filtered = sampleVideos.filter((v) => v.language === 'English')
    const result = selectAllVideos(filtered)
    expect(result).toEqual(['vid1', 'vid3', 'vid5'])
  })
})

describe('isValidSelection', () => {
  it('returns false for empty selection', () => {
    expect(isValidSelection([])).toBe(false)
  })

  it('returns true for single selection', () => {
    expect(isValidSelection(['vid1'])).toBe(true)
  })

  it('returns true for max selection (10)', () => {
    const selection = Array.from({ length: 10 }, (_, i) => `vid${i}`)
    expect(isValidSelection(selection)).toBe(true)
  })

  it('returns false for over max selection (11+)', () => {
    const selection = Array.from({ length: 11 }, (_, i) => `vid${i}`)
    expect(isValidSelection(selection)).toBe(false)
  })

  it('returns true for typical selection sizes', () => {
    expect(isValidSelection(['vid1', 'vid2', 'vid3'])).toBe(true)
    expect(isValidSelection(['vid1', 'vid2', 'vid3', 'vid4', 'vid5'])).toBe(true)
  })
})

describe('constants', () => {
  it('MAX_SELECTION is 10', () => {
    expect(MAX_SELECTION).toBe(10)
  })

  it('DEFAULT_FILTERS has correct structure', () => {
    expect(DEFAULT_FILTERS).toEqual({
      year: 'All Years',
      topic: 'All Topics',
      language: 'All Languages',
      gender: 'All Genders',
    })
  })
})
