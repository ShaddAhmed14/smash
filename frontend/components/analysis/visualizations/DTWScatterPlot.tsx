'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface VideoInfo {
  title: string;
  speaker: string;
  duration: string;
}

interface DTWScatterPlotProps {
  onVideoSelect?: (videoInfo: VideoInfo) => void;
}

// Sample video data
const sampleVideos = [
  { title: "Why working from home is good for business", speaker: "Matt Mullenweg", duration: "4:38" },
  { title: "The disarming case to act on climate change", speaker: "Greta Thunberg", duration: "6:00" },
  { title: "A beginner's guide to quantum computing", speaker: "Shohini Ghose", duration: "10:00" },
  { title: "How to transform sinking cities", speaker: "Kotchakorn Voraakhom", duration: "5:00" },
  { title: "A life-saving device for heart attacks", speaker: "Akash Manoj", duration: "6:00" },
  { title: "Why you should bring your whole self to work", speaker: "The Way We Work", duration: "3:00" },
  { title: "Can we solve global warming?", speaker: "Sean Davis", duration: "4:00" }
];

const clusterNames = ['Tech', 'Science', 'Society', 'Health', 'Business'];
const clusterColors = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#E05A7A'];

// Seeded random for consistent data across renders
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate clustered data points (called once via useMemo)
const generateClusterData = (numPoints: number, numClusters: number, seed: number = 42) => {
  const data: Array<{ x: number; y: number; cluster: number; video: typeof sampleVideos[0] }> = [];
  const clusterCenters = [
    { x: 20, y: 70 }, { x: 50, y: 30 }, { x: 80, y: 60 },
    { x: 30, y: 40 }, { x: 70, y: 80 }
  ];

  for (let i = 0; i < numPoints; i++) {
    const cluster = Math.floor(seededRandom(seed + i) * numClusters);
    const center = clusterCenters[cluster];
    data.push({
      x: center.x + (seededRandom(seed + i * 2) - 0.5) * 25,
      y: center.y + (seededRandom(seed + i * 3) - 0.5) * 25,
      cluster: cluster,
      video: sampleVideos[Math.floor(seededRandom(seed + i * 4) * sampleVideos.length)]
    });
  }
  return data;
};

const DTWScatterPlot = ({ onVideoSelect }: DTWScatterPlotProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  // Generate data once and cache it
  const data = useMemo(() => generateClusterData(200, 5, 42), []);

  // Build traces from cached data
  const traces = useMemo(() => {
    const result = [];
    for (let c = 0; c < 5; c++) {
      const clusterData = data.filter(d => d.cluster === c);
      result.push({
        x: clusterData.map(d => d.x),
        y: clusterData.map(d => d.y),
        mode: 'markers',
        type: 'scatter',
        name: clusterNames[c],
        marker: {
          color: clusterColors[c],
          size: 10,
          opacity: 0.7
        },
        text: clusterData.map(d => `<b>${d.video.title}</b><br>${d.video.speaker}<br>${d.video.duration}`),
        hoverinfo: 'text',
        customdata: clusterData.map(d => d.video),
      });
    }
    return result;
  }, [data]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 50, r: 30, t: 30, b: 50 },
    xaxis: {
      title: 'DTW Distance (Component 1)',
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      color: textColor
    },
    yaxis: {
      title: 'DTW Distance (Component 2)',
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      color: textColor
    },
    legend: {
      orientation: 'h' as const,
      y: -0.15,
      x: 0.5,
      xanchor: 'center' as const,
      font: { color: textColor }
    },
    hovermode: 'closest' as const,
    autosize: true,
  }), [bgColor, textColor, gridColor]);

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  const handleClick = (event: any) => {
    if (event.points && event.points.length > 0 && onVideoSelect) {
      const point = event.points[0];
      const videoInfo = point.customdata as VideoInfo;
      onVideoSelect(videoInfo);
    }
  };

  return (
    <div className="w-full h-full">
      <Plot
        data={traces as any}
        layout={layout as any}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        onClick={handleClick}
      />
    </div>
  );
};

export default DTWScatterPlot;
