/**
 * Video filtering utilities for VideoLibraryPage.
 * Extracted for testability.
 */

export interface VideoMetadata {
  video_id: string;
  video_name: string;
  year: number;
  language: string;
  speaker_gender: string;
  topics: string[];
  duration: number;
  speaker_name: string;
}

export interface FilterState {
  year: string;
  topic: string;
  language: string;
  gender: string;
}

export const DEFAULT_FILTERS: FilterState = {
  year: "All Years",
  topic: "All Topics",
  language: "All Languages",
  gender: "All Genders",
};

/**
 * Filters videos based on the current filter state.
 * All filters use AND logic - video must match all non-default filters.
 */
export function filterVideos(
  videos: VideoMetadata[],
  filters: FilterState
): VideoMetadata[] {
  if (!videos || videos.length === 0) return [];

  return videos.filter((video) => {
    const matchYear =
      filters.year === "All Years" || video.year.toString() === filters.year;
    const matchTopic =
      filters.topic === "All Topics" || video.topics.includes(filters.topic);
    const matchLanguage =
      filters.language === "All Languages" ||
      video.language === filters.language;
    const matchGender =
      filters.gender === "All Genders" ||
      video.speaker_gender === filters.gender;

    return matchYear && matchTopic && matchLanguage && matchGender;
  });
}

/**
 * Handles video selection toggle logic.
 * Returns the new selection array.
 */
export function toggleVideoSelection(
  currentSelection: string[],
  videoId: string
): string[] {
  if (currentSelection.includes(videoId)) {
    return currentSelection.filter((id) => id !== videoId);
  }
  return [...currentSelection, videoId];
}

/**
 * Selects all videos from the filtered list.
 */
export function selectAllVideos(filteredVideos: VideoMetadata[]): string[] {
  return filteredVideos.map((video) => video.video_id);
}

/**
 * Validates if the current selection is valid for processing.
 * Selection must have at least 1 and at most 10 videos.
 */
export function isValidSelection(selection: string[]): boolean {
  return selection.length > 0 && selection.length <= 10;
}

/**
 * Gets the maximum allowed selection count.
 */
export const MAX_SELECTION = 10;
