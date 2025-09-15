'use client'
import Plot from 'react-plotly.js';

const KinematicFeaturesGraph = ({x, y, title, x_label, y_label}) => {
  const traces = [
    {
      type: 'violin',
      y: y,
      x0:0,
      name: 'Distribution',
      opacity: 0.7,
      fillcolor: "rgba(100, 100, 100, 0.2)",
      line: { color: 'rgba(100, 100, 100, 0.5)' },
      box: { visible: false },
      meanline: { visible: true },
      points: false,
      hoverinfo: 'y+name',
      side: 'both'
    },
    {
      type: 'box',
      y: y,
      x0:0,
      name: 'Statistics',
      boxpoints: false,
      fillcolor: 'rgba(255,255,255,0)',
      line: { color: "rgba(0, 0, 0, 0.8)", width: 2 },
      marker: { 
        color: "rgba(0, 0, 0, 0.8)",
        size: 4
      },
      whiskerwidth: 0.3,
      width: 0.3,
      hoverinfo: 'y+name'
    },
    {
      type: 'scatter',
      mode: 'markers',
      x: x,
      y: y,
      name: 'All Gestures',
      marker: { 
        size: 6, 
        color: "rgba(200, 200, 200, 0.7)",
        opacity: 0.7,
        line: {
          color: 'white',
          width: 1
        }
      },
      hovertemplate: '<b>X:</b> %{x}<br><b>Y:</b> %{y}<extra></extra>'
    }
  ]

  const layout = {
    title: {
      text: title,
      font: { size: 16, family: 'Arial, sans-serif' }
    },
    xaxis: { 
      title: x_label,
      gridcolor: 'rgba(128,128,128,0.2)',
      zeroline: false
    },
    yaxis: { 
      title: y_label,
      gridcolor: 'rgba(128,128,128,0.2)',
      zeroline: false
    },
    showlegend: false,
    legend: {
      x: 1,
      xanchor: 'left',
      y: 1
    },
    hovermode: 'closest',
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 20, r: 20, t: 30, b: 20 }
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: title,
      height: 500,
      width: 700,
      scale: 1
    }
  }

  return (
    <div className="w-full h-full m-4">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        useResizeHandler={true}
        style={{ width: '100%', height: '400px' }}
      />
    </div>  
    )}

export default KinematicFeaturesGraph