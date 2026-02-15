'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const weeks = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateTimelineData = (seed: number = 555) => {
  return weeks.map((_, i) => Math.floor(seededRandom(seed + i) * 80 + 20));
};

const ActivityTimeline = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  // Generate data once and cache
  const values = useMemo(() => generateTimelineData(555), []);

  const trace = useMemo(() => ({
    x: weeks,
    y: values,
    type: 'bar',
    marker: {
      color: values.map(v => {
        const intensity = v / 100;
        return `rgba(255, 193, 102, ${0.4 + intensity * 0.6})`;
      }),
      line: { color: '#FFC166', width: 1 }
    },
    hovertemplate: '<b>%{x}</b><br>Videos: %{y}<extra></extra>',
  }), [values]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 50, r: 30, t: 30, b: 60 },
    xaxis: {
      title: 'Week',
      tickmode: 'array' as const,
      tickvals: [0, 4, 8, 13, 17, 21, 26, 30, 35, 39, 43, 48],
      ticktext: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      gridcolor: gridColor,
      color: textColor
    },
    yaxis: {
      title: 'Videos Processed',
      gridcolor: gridColor,
      color: textColor
    },
    bargap: 0.1,
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

export default ActivityTimeline;
