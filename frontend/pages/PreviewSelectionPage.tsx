'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dropdown, Tag, InlineNotification } from '@carbon/react';
import { Settings, Play } from '@carbon/icons-react';
import NavBar from '@/components/NavBar';
import Loader from '@/components/Loader';

interface VideoInfo {
  video_name: string;
  speaker_gender: string;
  language: string;
  duration: number;
  topics: string[];
}

const MAX_SELECTION = 10;

const PreviewSelectionPage = () => {
  const router = useRouter();
  const [videoMetadata, setVideoMetadata] = useState<VideoInfo[] | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [durationFilter, setDurationFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PREVIEW}/fetch_metadata`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setVideoMetadata(data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load videos. Please try again.');
      }
    };

    fetchMetadata();
  }, []);

  const toggleVideoSelection = (videoName: string) => {
    const newSelection = new Set(selectedVideos);

    if (newSelection.has(videoName)) {
      newSelection.delete(videoName);
    } else if (newSelection.size < MAX_SELECTION) {
      newSelection.add(videoName);
    }

    setSelectedVideos(newSelection);
  };

  const clearSelection = () => {
    setSelectedVideos(new Set());
  };

  const handleProcessVideos = () => {
    if (selectedVideos.size > 0) {
      // Store selected videos in session storage or pass to next page
      sessionStorage.setItem('selectedVideos', JSON.stringify(Array.from(selectedVideos)));
      router.push('/preview/processing');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (videoMetadata === null) {
    return <Loader name="Video Library" />;
  }

  const totalDuration = videoMetadata.reduce((sum, video) => sum + video.duration, 0);
  const uniqueSpeakers = new Set(videoMetadata.map(v => v.speaker_gender)).size;

  return (
    <>
      <NavBar currentPage="Preview" />

      <main className="mt-12 min-h-screen flex flex-col">
        {/* Page Header */}
        <div className="px-6 py-6 border-b border-primary">
          <h1 className="text-[1.5rem] font-normal mb-2">Preview Module</h1>
          <div className="w-12 h-0.5 bg-[#E05A7A] mb-3" />
          <p className="text-[0.875rem] text-secondary">
            Select videos for multimodal analysis. Choose up to {MAX_SELECTION} videos to process.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="px-6 py-4">
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
            />
          </div>
        )}

        {/* Filter Bar */}
        <div className="px-6 py-4 bg-secondary border-b border-primary flex flex-wrap items-center gap-4">
          <span className="text-[0.75rem] font-semibold uppercase tracking-wide text-secondary">
            Filters:
          </span>

          <Dropdown
            id="duration-filter"
            titleText=""
            label="All durations"
            items={[
              { id: 'all', text: 'All durations' },
              { id: '0-5', text: '0-5 minutes' },
              { id: '5-10', text: '5-10 minutes' },
              { id: '10-15', text: '10-15 minutes' },
              { id: '15+', text: '15+ minutes' }
            ]}
            itemToString={(item) => (item ? item.text : '')}
            onChange={({ selectedItem }) => setDurationFilter(selectedItem?.id || 'all')}
            size="sm"
          />

          <Dropdown
            id="year-filter"
            titleText=""
            label="All years"
            items={[
              { id: 'all', text: 'All years' },
              { id: '2024', text: '2024' },
              { id: '2023', text: '2023' },
              { id: '2022', text: '2022' }
            ]}
            itemToString={(item) => (item ? item.text : '')}
            onChange={({ selectedItem }) => setYearFilter(selectedItem?.id || 'all')}
            size="sm"
          />

          <Dropdown
            id="category-filter"
            titleText=""
            label="All categories"
            items={[
              { id: 'all', text: 'All categories' },
              { id: 'tech', text: 'Technology' },
              { id: 'science', text: 'Science' },
              { id: 'society', text: 'Society' },
              { id: 'health', text: 'Health' }
            ]}
            itemToString={(item) => (item ? item.text : '')}
            onChange={({ selectedItem }) => setCategoryFilter(selectedItem?.id || 'all')}
            size="sm"
          />

          {/* Stats */}
          <div className="ml-auto hidden md:flex gap-6 text-[0.875rem]">
            <div>
              <span className="font-semibold">{videoMetadata.length}</span>{' '}
              <span className="text-secondary">videos</span>
            </div>
            <div>
              <span className="font-semibold">{Math.floor(totalDuration / 60)} min</span>{' '}
              <span className="text-secondary">total</span>
            </div>
            <div>
              <span className="font-semibold">{uniqueSpeakers}</span>{' '}
              <span className="text-secondary">speakers</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 px-6 py-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {videoMetadata.map((video) => {
              const isSelected = selectedVideos.has(video.video_name);
              const isDisabled = !isSelected && selectedVideos.size >= MAX_SELECTION;

              return (
                <div
                  key={video.video_name}
                  className={`bg-secondary border cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? 'border-[#0f62fe] border-2'
                      : 'border-primary hover:border-strong hover:shadow-lg hover:-translate-y-0.5'
                  } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => toggleVideoSelection(video.video_name)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-[180px] bg-gradient-to-br from-[#E05A7A] to-[#c44d6a] flex items-center justify-center text-white text-[40px]">
                    ▶
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 text-[0.75rem] font-mono">
                      {formatDuration(video.duration)}
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`absolute top-3 right-3 w-6 h-6 border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#0f62fe] border-[#0f62fe]'
                          : 'bg-white border-strong'
                      }`}
                    >
                      {isSelected && (
                        <span className="text-white text-sm font-bold">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Select Hint Overlay */}
                  {!isSelected && !isDisabled && (
                    <div className="absolute inset-0 bg-[#0f62fe]/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="bg-[#0f62fe] text-white px-4 py-2 text-[0.75rem] font-semibold">
                        Click to select
                      </span>
                    </div>
                  )}

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="text-[0.9375rem] font-semibold mb-1.5 line-clamp-2 leading-[1.4]">
                      {video.video_name}
                    </h3>
                    <p className="text-[0.8125rem] text-secondary mb-3">
                      {video.speaker_gender} · {video.language}
                    </p>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1.5">
                      {video.topics?.map((topic, idx) => (
                        <Tag
                          key={idx}
                          type="gray"
                          size="sm"
                          className="text-[0.6875rem]"
                        >
                          {topic}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar (Fixed Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-secondary border-t border-primary flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3 text-[0.875rem]">
            <span className="text-secondary">
              <span
                className={`font-semibold text-primary inline-block min-w-[20px] text-center transition-transform ${
                  selectedVideos.size > 0 ? 'scale-125' : ''
                }`}
              >
                {selectedVideos.size}
              </span>{' '}
              videos selected
            </span>

            <span
              className={`text-[0.75rem] px-2 py-1 border ${
                selectedVideos.size >= MAX_SELECTION
                  ? 'bg-[#fff3cd] border-[#ffc107] text-[#856404]'
                  : 'bg-primary border-primary text-tertiary'
              }`}
            >
              {selectedVideos.size >= MAX_SELECTION ? 'Max reached!' : `Max ${MAX_SELECTION}`}
            </span>

            {selectedVideos.size > 0 && (
              <button
                className="text-[0.75rem] text-tertiary underline hover:text-primary cursor-pointer bg-transparent border-none"
                onClick={clearSelection}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              kind="secondary"
              renderIcon={Settings}
              size="lg"
            >
              Configure
            </Button>

            <Button
              kind="primary"
              renderIcon={Play}
              size="lg"
              disabled={selectedVideos.size === 0}
              onClick={handleProcessVideos}
            >
              Process Videos
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default PreviewSelectionPage;
