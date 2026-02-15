'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const sampleVideos = [
  { title: "Why working from home is good for business", speaker: "Matt Mullenweg" },
  { title: "The disarming case to act on climate change", speaker: "Greta Thunberg" },
  { title: "A beginner's guide to quantum computing", speaker: "Shohini Ghose" },
  { title: "How to transform sinking cities", speaker: "Kotchakorn Voraakhom" },
  { title: "A life-saving device for heart attacks", speaker: "Akash Manoj" },
  { title: "Why you should bring your whole self to work", speaker: "The Way We Work" },
  { title: "Can we solve global warming?", speaker: "Sean Davis" }
];

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate UMAP-like clustered data with seed
const generateDataMapPoints = (n: number, seed: number = 321) => {
  const x: number[] = [];
  const y: number[] = [];
  const colors: number[] = [];
  const texts: string[] = [];

  // Create cluster centers for more realistic UMAP output
  const clusters = [
    { cx: 25, cy: 25, spread: 15 },
    { cx: 75, cy: 30, spread: 12 },
    { cx: 50, cy: 70, spread: 18 },
    { cx: 20, cy: 65, spread: 10 },
    { cx: 80, cy: 75, spread: 14 },
  ];

  for (let i = 0; i < n; i++) {
    const clusterIdx = Math.floor(seededRandom(seed + i) * clusters.length);
    const cluster = clusters[clusterIdx];

    x.push(cluster.cx + (seededRandom(seed + i * 2) - 0.5) * cluster.spread * 2);
    y.push(cluster.cy + (seededRandom(seed + i * 3) - 0.5) * cluster.spread * 2);

    const video = sampleVideos[Math.floor(seededRandom(seed + i * 4) * sampleVideos.length)];
    colors.push(clusterIdx / clusters.length);
    texts.push(`<b>${video.title}</b><br>${video.speaker}`);
  }

  return { x, y, colors, texts };
};

const DataMapPlot = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  // Generate data once and cache
  const { x, y, colors, texts } = useMemo(() => generateDataMapPoints(300, 321), []);

  const trace = useMemo(() => ({
    x,
    y,
    mode: 'markers',
    type: 'scatter',
    marker: {
      color: colors,
      colorscale: 'Viridis',
      size: 8,
      opacity: 0.7,
      colorbar: {
        title: 'Density',
        titlefont: { family: 'IBM Plex Sans', color: textColor }
      }
    },
    text: texts,
    hoverinfo: 'text',
  }), [x, y, colors, texts, textColor]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 50, r: 80, t: 30, b: 50 },
    xaxis: {
      title: 'UMAP 1',
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      color: textColor
    },
    yaxis: {
      title: 'UMAP 2',
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      color: textColor
    },
    hovermode: 'closest' as const,
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

export default DataMapPlot;
