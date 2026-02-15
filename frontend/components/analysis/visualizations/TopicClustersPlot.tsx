'use client';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const clusterColors = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#E05A7A'];

const clusters = [
  { name: 'Tech', count: 847, x: 30, y: 60 },
  { name: 'Science', count: 623, x: 70, y: 70 },
  { name: 'Society', count: 512, x: 50, y: 35 },
  { name: 'Health', count: 389, x: 25, y: 25 },
  { name: 'Business', count: 445, x: 75, y: 30 }
];

const TopicClustersPlot = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';

  const trace = {
    x: clusters.map(c => c.x),
    y: clusters.map(c => c.y),
    mode: 'markers+text',
    type: 'scatter',
    marker: {
      size: clusters.map(c => Math.sqrt(c.count) * 2),
      color: clusterColors.slice(0, 5),
      opacity: 0.7
    },
    text: clusters.map(c => c.name),
    textposition: 'center',
    textfont: { color: 'white', size: 14, family: 'IBM Plex Sans' },
    hovertext: clusters.map(c => `<b>${c.name}</b><br>${c.count} videos`),
    hoverinfo: 'text',
  };

  const layout = {
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 50, r: 30, t: 30, b: 50 },
    xaxis: { visible: false, range: [0, 100] },
    yaxis: { visible: false, range: [0, 100] },
    showlegend: false,
    hovermode: 'closest' as const,
    autosize: true,
  };

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

export default TopicClustersPlot;
