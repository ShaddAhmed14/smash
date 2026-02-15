'use client';

import { useState } from 'react';
import NavBar from '@/components/NavBar';
import AnalyticsVisualizationContainer from '@/components/analytics/AnalyticsVisualizationContainer';
import StatsPanel from '@/components/analytics/StatsPanel';

export type AnalyticsVisualizationType = 'semnet' | 'wordcloud' | 'radar' | 'heatmap' | 'correlation' | 'topics' | 'timeline';

const visualizationOptions = [
  { key: 'semnet', label: 'Semantic Networks', title: 'Semantic Networks (Embeddings vs TF-IDF)' },
  { key: 'wordcloud', label: 'Word Cloud', title: 'Word Cloud - Top Terms' },
  { key: 'radar', label: 'Feature Radar', title: 'Feature Radar - Multimodal Analysis' },
  { key: 'heatmap', label: 'Gesture Heatmap', title: 'Gesture Heatmap (Hour × Day)' },
  { key: 'correlation', label: 'Feature Correlation', title: 'Feature Correlation Matrix' },
  { key: 'topics', label: 'Topic Distribution', title: 'Topic Distribution' },
  { key: 'timeline', label: 'Activity Timeline', title: 'Activity Timeline (52 Weeks)' },
];

const AnalyticsPage = () => {
  const [selectedViz, setSelectedViz] = useState<AnalyticsVisualizationType>('semnet');

  const currentVizOption = visualizationOptions.find(v => v.key === selectedViz)!;

  return (
    <>
      <NavBar currentPage="Analytics" />

      <main className="mt-12 min-h-screen flex flex-col p-4 gap-4">
        {/* Content Switcher Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.875rem] text-secondary">Select view:</span>

          <div className="flex gap-2 flex-wrap">
            {visualizationOptions.map((viz) => (
              <button
                key={viz.key}
                onClick={() => setSelectedViz(viz.key as AnalyticsVisualizationType)}
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
            <AnalyticsVisualizationContainer
              visualizationType={selectedViz}
              title={currentVizOption.title}
            />
          </div>

          {/* Stats Panel */}
          <StatsPanel />
        </div>
      </main>
    </>
  );
};

export default AnalyticsPage;
