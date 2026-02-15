'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const clusterNames = ['Tech', 'Science', 'Society', 'Health', 'Business'];
const clusterColors = ['#8a3ffc', '#33b1ff', '#007d79', '#ff7eb6', '#FFC166'];

interface NetworkData {
  nodes: Array<{ x: number; y: number; cluster: number }>;
  edges: Array<{ from: number; to: number }>;
}

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateNetworkData = (clustered: boolean, seed: number): NetworkData => {
  const nodes: Array<{ x: number; y: number; cluster: number }> = [];
  const edges: Array<{ from: number; to: number }> = [];
  const centers = [
    { x: 20, y: 70 }, { x: 50, y: 25 }, { x: 80, y: 65 },
    { x: 25, y: 30 }, { x: 75, y: 25 }
  ];

  for (let i = 0; i < 100; i++) {
    const cluster = Math.floor(seededRandom(seed + i) * 5);
    const spread = clustered ? 12 : 20;
    nodes.push({
      x: centers[cluster].x + (seededRandom(seed + i * 2) - 0.5) * spread,
      y: centers[cluster].y + (seededRandom(seed + i * 3) - 0.5) * spread,
      cluster: cluster
    });
  }

  const edgeCount = clustered ? 180 : 100;
  for (let i = 0; i < edgeCount; i++) {
    const n1 = Math.floor(seededRandom(seed + i * 5) * nodes.length);
    let n2;
    if (clustered && seededRandom(seed + i * 6) > 0.3) {
      const sameCluster = nodes.map((n, idx) => ({ n, idx })).filter(item => item.n.cluster === nodes[n1].cluster);
      n2 = sameCluster[Math.floor(seededRandom(seed + i * 7) * sameCluster.length)].idx;
    } else {
      n2 = Math.floor(seededRandom(seed + i * 8) * nodes.length);
    }
    if (n1 !== n2) edges.push({ from: n1, to: n2 });
  }

  return { nodes, edges };
};

const NetworkPlot = ({ clustered, title, edgeCount, seed }: { clustered: boolean; title: string; edgeCount: string; seed: number }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#262626' : '#ffffff';
  const textColor = isDark ? '#f4f4f4' : '#161616';
  const gridColor = isDark ? '#393939' : '#e0e0e0';

  // Generate data once and cache
  const data = useMemo(() => generateNetworkData(clustered, seed), [clustered, seed]);

  // Build traces from cached data
  const { edgeTrace, nodeTraces } = useMemo(() => {
    const edgeX: (number | null)[] = [];
    const edgeY: (number | null)[] = [];
    data.edges.forEach(e => {
      edgeX.push(data.nodes[e.from].x, data.nodes[e.to].x, null);
      edgeY.push(data.nodes[e.from].y, data.nodes[e.to].y, null);
    });

    const edgeTrace = {
      x: edgeX,
      y: edgeY,
      mode: 'lines',
      type: 'scatter',
      line: { color: gridColor, width: 0.5 },
      hoverinfo: 'none',
      showlegend: false,
    };

    const nodeTraces = [];
    for (let c = 0; c < 5; c++) {
      const clusterNodes = data.nodes.filter(n => n.cluster === c);
      nodeTraces.push({
        x: clusterNodes.map(n => n.x),
        y: clusterNodes.map(n => n.y),
        mode: 'markers',
        type: 'scatter',
        name: clusterNames[c],
        marker: { color: clusterColors[c], size: 6, opacity: 0.7 },
        hovertemplate: `${clusterNames[c]}<extra></extra>`
      });
    }

    return { edgeTrace, nodeTraces };
  }, [data, gridColor]);

  const layout = useMemo(() => ({
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    font: { family: 'IBM Plex Sans', color: textColor, size: 9 },
    margin: { l: 10, r: 10, t: 35, b: 30 },
    xaxis: { visible: false, range: [0, 100] },
    yaxis: { visible: false, range: [0, 100] },
    legend: { orientation: 'h' as const, y: -0.05, x: 0.5, xanchor: 'center' as const, font: { size: 8 } },
    hovermode: 'closest' as const,
    showlegend: true,
    annotations: [{
      x: 0.5,
      y: 1.05,
      xref: 'paper' as const,
      yref: 'paper' as const,
      text: `<b>${title}</b> <span style="font-weight:400; color:${isDark ? '#8d8d8d' : '#525252'}">thresh: ${clustered ? '0.75' : '0.60'} | ${edgeCount} edges</span>`,
      showarrow: false,
      font: { size: 11, family: 'IBM Plex Sans' },
      xanchor: 'center' as const
    }]
  }), [bgColor, textColor, title, clustered, edgeCount, isDark]);

  const config = {
    responsive: true,
    displayModeBar: false
  };

  return (
    <Plot
      data={[edgeTrace, ...nodeTraces] as any}
      layout={layout as any}
      config={config}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
};

const SemanticNetworks = () => {
  return (
    <div className="w-full h-full flex gap-3">
      <div className="flex-1 bg-primary border border-primary flex flex-col">
        <NetworkPlot clustered={true} title="Embeddings" edgeCount="12,847" seed={111} />
      </div>
      <div className="flex-1 bg-primary border border-primary flex flex-col">
        <NetworkPlot clustered={false} title="TF-IDF" edgeCount="8,392" seed={222} />
      </div>
    </div>
  );
};

export default SemanticNetworks;
