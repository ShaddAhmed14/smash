'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const features = ['Gesture', 'Prosody', 'Facial', 'Topic', 'Audio'];

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateCorrelationData = (seed: number = 444) => {
  return features.map((_, i) =>
    features.map((_, j) => i === j ? 1 : parseFloat((seededRandom(seed + i * 10 + j) * 0.6 + 0.2).toFixed(2)))
  );
};

const CorrelationMatrix = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';

  // Generate data once and cache
  const z = useMemo(() => generateCorrelationData(444), []);

  // Create annotations for cell values
  const annotations = useMemo(() => {
    const result = [];
    for (let i = 0; i < features.length; i++) {
      for (let j = 0; j < features.length; j++) {
        result.push({
          x: features[j],
          y: features[i],
          text: z[i][j].toFixed(2),
          showarrow: false,
          font: { color: z[i][j] > 0.6 ? 'white' : textColor, size: 12 }
        });
      }
    }
    return result;
  }, [z, textColor]);

  const trace = useMemo(() => ({
    z: z,
    x: features,
    y: features,
    type: 'heatmap',
    colorscale: [
      [0, '#e0e0e0'],
      [0.5, '#3ddbd9'],
      [1, '#007d79']
    ],
    showscale: true,
    colorbar: {
      title: 'Correlation',
      titlefont: { family: 'IBM Plex Sans', color: textColor }
    },
    hovertemplate: '<b>%{y} × %{x}</b><br>Correlation: %{z:.2f}<extra></extra>'
  }), [z, textColor]);

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
    annotations: annotations,
    autosize: true,
  }), [bgColor, textColor, annotations]);

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

export default CorrelationMatrix;
