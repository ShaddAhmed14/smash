'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const clusterColors = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#FFC166'];

const words = [
  { word: 'technology', freq: 847 }, { word: 'innovation', freq: 623 },
  { word: 'climate', freq: 512 }, { word: 'AI', freq: 789 },
  { word: 'future', freq: 698 }, { word: 'science', freq: 445 },
  { word: 'data', freq: 567 }, { word: 'health', freq: 389 },
  { word: 'society', freq: 478 }, { word: 'education', freq: 334 },
  { word: 'creativity', freq: 412 }, { word: 'leadership', freq: 298 },
  { word: 'sustainability', freq: 367 }, { word: 'design', freq: 323 },
  { word: 'research', freq: 278 }, { word: 'business', freq: 489 }
];

// Seeded random for consistent positions
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate stable word positions
const generateWordPositions = (seed: number = 666) => {
  return words.map((_, i) => ({
    x: seededRandom(seed + i * 2) * 80 + 10,
    y: seededRandom(seed + i * 3) * 80 + 10
  }));
};

const WordCloudViz = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';

  const maxFreq = Math.max(...words.map(w => w.freq));

  // Generate positions once and cache
  const positions = useMemo(() => generateWordPositions(666), []);

  const trace = useMemo(() => ({
    x: positions.map(p => p.x),
    y: positions.map(p => p.y),
    mode: 'text',
    type: 'scatter',
    text: words.map(w => w.word),
    textfont: {
      size: words.map(w => 12 + (w.freq / maxFreq) * 28),
      color: words.map((_, i) => clusterColors[i % clusterColors.length]),
      family: 'IBM Plex Sans'
    },
    hovertext: words.map(w => `<b>${w.word}</b><br>Frequency: ${w.freq}`),
    hoverinfo: 'text',
  }), [positions, maxFreq]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 20, r: 20, t: 20, b: 20 },
    xaxis: { visible: false, range: [0, 100] },
    yaxis: { visible: false, range: [0, 100] },
    hovermode: 'closest' as const,
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

export default WordCloudViz;
