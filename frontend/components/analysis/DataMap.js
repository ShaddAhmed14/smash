'use client'
import { useState, useEffect, memo, useMemo } from 'react'
import PlotTemplate from '../PlotTemplate'
import { API_ROUTES } from '../../lib/api'

const DataMap = memo(function DataMap({plot_name}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Data Map",
      height: 500,
      width: 700,
      scale: 1
    }
  }

  useEffect(() => {
    let url = API_ROUTES.ANALYSIS + "/fetch_data_map"
    fetch(url)
        .then(response => {
        return response.json().then(fetchedData => {
          if (!response.ok) {
            throw new Error(fetchedData.message || response.statusText);
          }
          return fetchedData;
        });
      })
    .then(fetchedData => {
        setData(fetchedData)
    })
    .catch(err => {
            console.error("Fetch error:", err);
            setError(err.message || err.toString());
        })
      
  }, [])

 
  const getColoredCluster = (topic_data, colors) => {
    const traces = []
    const annotations = []
    for (const topic of topic_data) {
        const color = colors[topic.topic_id] || 'black'
        traces.push({
            x: topic.topic_docs.map(doc => doc[0]),
            y: topic.topic_docs.map(doc => doc[1]),
            text: topic.label || [],
            type: 'scatter',
            mode: 'markers',
            marker: {size: 4, color: color},
            hoverinfo: 'skip',
            hovertemplate: null,
        })
        annotations.push({
            x: topic.centroid_x,
            y: topic.centroid_y,
            text: topic.label,
            showarrow: true,
            arrowhead: 2,
            arrowsize:1,
            arrowwidth:1,
            ax:50, 
            ay:-50,
            arrowcolor:'#666',
            font: {size:11, color:'#333'},
            bgcolor:'white',
            borderpad:4
        })
        }
    return [traces, annotations]
    }

  const processedData = useMemo(() => {
      if (!data) return {}
      const colors = ['#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#A855F7', '#D946EF']
      let labels = data.titles.map(label => label.split("/").pop().split("_transcript")[0]) || []
    
      let dataPoints = {
        x: data.reduced_embeddings.map(coord => coord[0]) || [],
        y: data.reduced_embeddings.map(coord => coord[1]) || [],
        text: labels || [],
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: 'lightgray',
          size: 3,
        },
        hovertemplate: 'Name: %{text}<extra></extra>',
      }
      const [all_traces, annotations] = getColoredCluster(data.topic_data, colors)

      const axis_layout = {showtickLabels: false, zeroline: false, showgrid: false, title:''}
      const layout={
        xaxis: axis_layout,
        yaxis: axis_layout,
        autosize: true,
        showlegend: false,
        annotations: annotations,
        margin: {l:0, r:0, b:0, t:0}
      }

      return {traces: [dataPoints, ...all_traces], layout: layout}
    //   return [dataPoints]
    }, [data])

   return (
    <>
    { 
        error ?
        <p className="m-2 text-md">Error loading Data Map plot: {error.toString()}</p>
        :
        <PlotTemplate layout={processedData.layout} config={config} data={processedData.traces} name={plot_name} />
    }
    </>
)})

export default DataMap