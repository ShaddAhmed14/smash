'use client';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const clusterColors = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#FFC166', '#3ddbd9'];
const topics = ['Technology', 'Science', 'Business', 'Society', 'Health', 'Other'];
const values = [28, 22, 18, 15, 10, 7];

const TopicDistribution = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  const trace = {
    y: [...topics].reverse(),
    x: [...values].reverse(),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: [...clusterColors].reverse(),
      opacity: 0.8
    },
    text: [...values].reverse().map(v => `${v}%`),
    textposition: 'outside',
    textfont: { family: 'IBM Plex Sans', size: 12, color: textColor },
    hovertemplate: '<b>%{y}</b><br>%{x}% of videos<extra></extra>',
  };

  const layout = {
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 100, r: 60, t: 30, b: 50 },
    xaxis: {
      title: 'Percentage of Videos',
      gridcolor: gridColor,
      range: [0, 35],
      color: textColor
    },
    yaxis: {
      title: '',
      color: textColor
    },
    bargap: 0.3,
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

export default TopicDistribution;
