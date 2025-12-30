'use client'
import {useState, useEffect, memo, useMemo} from 'react'
import dynamic from 'next/dynamic'
import PlotTemplate from '../PlotTemplate'

const Plot = dynamic(() => import('react-plotly.js'), {ssr:false})

const MetadataGraph = memo(function MetadataGraph() {
  const [videoMetadata, setVideoMetadata] = useState(null)
  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_metadata_graph"
    fetch(url)
        .then(response => {
        return response.json().then(fetchedData => {
          if (!response.ok) {
            throw new Error(fetchedData.message || response.statusText);
          }
          return fetchedData;
        });
      })
      .then(data => {
        setVideoMetadata(data)})
      .catch(err => {
        console.log("Fetch error:", err);
        setError(err.message || err.toString());
      })
  }, [])

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Metadata Graph",
      height: 500,
      width: 700,
      scale: 1
    }
  }
  const layout = {
    scene: {
            xaxis: {title: 'Duration'},
            yaxis: {title: 'Speaker Gender'}, 
            zaxis: {title: 'Language'}
          },
    autosize: true,
    margin: {l: 20, r: 20, t: 20, b: 20}
  }
  const processedData = useMemo(() => {
    if(!videoMetadata) return {}
    
    let trace =  {
      x: videoMetadata.duration || [],
      y: videoMetadata.speaker_gender || [],
      z: videoMetadata.language || [],
      text: videoMetadata.video_name || [],
      type: 'scatter3d',
      mode: 'markers',
      marker: {size: 5},
      hovertemplate: "Video Name: %{text}<br>Duration: %{x}<br>Speaker Gender: %{y}<br>Language: %{z}"
    }

      return [trace] 
    }
    , [videoMetadata])

  return (
    <div className='w-full h-full'>
      <PlotTemplate config={config} layout={layout} data={processedData} name="Metadata" />
    </div>
  )
})

export default MetadataGraph