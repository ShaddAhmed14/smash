'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const topics = ['Tech', 'Science', 'Society', 'Health', 'Business'];

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate correlation matrix with seed
const generateInterdistanceData = (seed: number = 123) => {
  const z = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      if (i === j) {
        row.push(1);
      } else {
        row.push(seededRandom(seed + i * 10 + j) * 0.7 + 0.1);
      }
    }
    z.push(row);
  }
  return z;
};

const InterdistanceHeatmap = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';

  // Generate data once and cache
  const zData = useMemo(() => generateInterdistanceData(123), []);

  const trace = useMemo(() => ({
    z: zData,
    x: topics,
    y: topics,
    type: 'heatmap',
    colorscale: [
      [0, '#f4f4f4'],
      [0.5, '#3ddbd9'],
      [1, '#007d79']
    ],
    hovertemplate: '%{y} ↔ %{x}<br>Distance: %{z:.2f}<extra></extra>',
    showscale: true,
    colorbar: {
      title: 'Similarity',
      titlefont: { family: 'IBM Plex Sans', color: textColor }
    }
  }), [zData, textColor]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 80, r: 80, t: 30, b: 80 },
    xaxis: {
      side: 'bottom' as const,
      color: textColor
    },
    yaxis: {
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
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full max-w-[600px] max-h-[600px]">
        <Plot
          data={[trace] as any}
          layout={layout as any}
          config={config}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
};

export default InterdistanceHeatmap;
