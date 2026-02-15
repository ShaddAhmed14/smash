'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateHeatmapData = (seed: number = 333) => {
  return days.map((_, dayIdx) =>
    hours.map((_, hourIdx) => Math.floor(seededRandom(seed + dayIdx * 100 + hourIdx) * 100))
  );
};

const GestureHeatmap = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';

  // Generate data once and cache
  const zData = useMemo(() => generateHeatmapData(333), []);

  const trace = useMemo(() => ({
    z: zData,
    x: hours,
    y: days,
    type: 'heatmap',
    colorscale: [
      [0, '#f4f4f4'],
      [0.5, '#FFC166'],
      [1, '#E05A7A']
    ],
    hovertemplate: '<b>%{y} %{x}</b><br>Gestures: %{z}<extra></extra>',
    colorbar: {
      title: 'Count',
      titlefont: { family: 'IBM Plex Sans', color: textColor }
    }
  }), [zData, textColor]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 60, r: 80, t: 30, b: 60 },
    xaxis: {
      title: 'Hour of Day',
      tickangle: -45,
      color: textColor
    },
    yaxis: {
      title: '',
      autorange: 'reversed' as const,
      color: textColor
    },
    autosize: true,
  }), [bgColor, textColor]);

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

export default GestureHeatmap;
