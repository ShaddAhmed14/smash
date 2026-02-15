'use client';

import { useState } from 'react';
import { ContentSwitcher, Switch } from '@carbon/react';
import NavBar from '@/components/NavBar';
import VisualizationContainer from '@/components/analysis/VisualizationContainer';
import VideoComparisonPanel from '@/components/analysis/VideoComparisonPanel';

export type VisualizationType = 'dtw' | 'topic' | 'interdistance' | 'audio' | 'spectogram' | 'datamap';

interface VideoInfo {
  title: string;
  speaker: string;
  duration: string;
}

const visualizationOptions = [
  { key: 'dtw', label: 'Dynamic Time Warping (DTW)', title: 'Dynamic Time Warping (DTW) Analysis', hasVideos: true },
  { key: 'topic', label: 'Topic Clusters', title: 'Video Distribution by Topic Clusters', hasVideos: false },
  { key: 'interdistance', label: 'Topic Interdistance', title: 'Topic Interdistance Map', hasVideos: false },
  { key: 'audio', label: 'Audio Features', title: 'Average Audio Features', hasVideos: false },
  { key: 'spectogram', label: 'Spectogram Embeddings', title: 'Spectogram Embeddings', hasVideos: true },
  { key: 'datamap', label: 'Data Map', title: 'Data Map', hasVideos: false },
];

const AnalysisPage = () => {
  const [selectedViz, setSelectedViz] = useState<VisualizationType>('dtw');
  const [video1, setVideo1] = useState<VideoInfo>({
    title: 'Why working from home is good for business',
    speaker: 'The Way We Work',
    duration: '4:38'
  });
  const [video2, setVideo2] = useState<VideoInfo | null>(null);

  const currentVizOption = visualizationOptions.find(v => v.key === selectedViz)!;

  const handleVideoSelect = (videoInfo: VideoInfo) => {
    setVideo2(videoInfo);
  };

  return (
    <>
      <NavBar currentPage="Analysis" />

      <main className="mt-12 min-h-screen flex flex-col p-4 gap-4">
        {/* Content Switcher Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.875rem] text-secondary">Select visualization:</span>

          <div className="flex gap-2 flex-wrap">
            {visualizationOptions.map((viz) => (
              <button
                key={viz.key}
                onClick={() => setSelectedViz(viz.key as VisualizationType)}
                className={`h-9 px-4 font-sans text-[0.8125rem] transition-all border ${
                  selectedViz === viz.key
                    ? 'border-2 border-[#0f62fe] bg-secondary font-semibold'
                    : 'border border-primary bg-primary hover:border-strong hover:bg-secondary'
                }`}
              >
                {viz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Visualization Container */}
          <div className="flex-1 min-w-0">
            <VisualizationContainer
              visualizationType={selectedViz}
              title={currentVizOption.title}
              onVideoSelect={handleVideoSelect}
            />
          </div>

          {/* Video Comparison Panel (only shown for certain visualizations) */}
          {currentVizOption.hasVideos && (
            <VideoComparisonPanel
              video1={video1}
              video2={video2}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default AnalysisPage;
