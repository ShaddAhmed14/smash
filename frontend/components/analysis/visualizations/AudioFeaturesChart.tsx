'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const features = ['Pitch Variance', 'Energy', 'Tempo', 'Clarity', 'Rhythm', 'Tone'];
const clusterColors = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#E05A7A', '#3ddbd9'];

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate audio data with seed
const generateAudioData = (seed: number = 456) => {
  return features.map((_, i) => seededRandom(seed + i) * 60 + 30);
};

const AudioFeaturesChart = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  // Generate data once and cache
  const values = useMemo(() => generateAudioData(456), []);

  const trace = useMemo(() => ({
    x: features,
    y: values,
    type: 'bar',
    marker: {
      color: clusterColors,
      opacity: 0.8
    },
    hovertemplate: '<b>%{x}</b><br>Score: %{y:.1f}<extra></extra>',
  }), [values]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 50, r: 30, t: 30, b: 80 },
    xaxis: {
      tickangle: -45,
      color: textColor
    },
    yaxis: {
      title: 'Average Score',
      gridcolor: gridColor,
      range: [0, 100],
      color: textColor
    },
    bargap: 0.3,
    autosize: true,
  }), [bgColor, textColor, gridColor]);

  const config = {
    responsive: true,
    displaylogo: false
  };

  return (
    <div className="w-full h-full">
      <Plot
        data={[trace] as any}
        layout={layout as any}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default AudioFeaturesChart;
