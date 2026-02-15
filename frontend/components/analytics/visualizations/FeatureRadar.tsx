'use client';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const features = ['Gesture', 'Prosody', 'Facial', 'Topic', 'Audio'];
const values = [85, 72, 68, 78, 81];

const FeatureRadar = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  const trace = {
    type: 'scatterpolar',
    r: [...values, values[0]],
    theta: [...features, features[0]],
    fill: 'toself',
    fillcolor: 'rgba(255, 193, 102, 0.3)',
    line: { color: '#FFC166', width: 2 },
    marker: { color: '#FFC166', size: 8 },
    hovertemplate: '<b>%{theta}</b><br>Score: %{r}<extra></extra>'
  };

  const layout = {
    paper_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor },
    margin: { l: 60, r: 60, t: 40, b: 40 },
    polar: {
      bgcolor: bgColor,
      radialaxis: {
        visible: true,
        range: [0, 100],
        gridcolor: gridColor,
        linecolor: gridColor,
        tickfont: { color: textColor }
      },
      angularaxis: {
        gridcolor: gridColor,
        linecolor: gridColor,
        tickfont: { color: textColor }
      }
    },
    showlegend: false,
    autosize: true,
  };

  const config = {
    responsive: true,
    displaylogo: false
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full max-w-[500px] max-h-[500px]">
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

export default FeatureRadar;
