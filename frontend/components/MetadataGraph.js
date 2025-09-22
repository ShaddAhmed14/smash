'use client'
import {useState, useEffect, memo} from 'react'
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), {ssr:false})

const MetadataGraph = memo(function MetadataGraph() {
  const [videoMetadata, setVideoMetadata] = useState(null)
  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_metadata_graph"
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok", response);
        }
        return response.json();
      })
      .then(data => {
        setVideoMetadata(data)})
      .catch(error => {
        console.error("Error fetching metadata:", error);
      });
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

  return (
    <div className='w-full h-full'>
      <Plot
        config={config}
        data={[{
          x: videoMetadata?.duration || [],
          y: videoMetadata?.speaker_gender || [],
          z: videoMetadata?.language || [],
          text: videoMetadata?.video_name || [],
          type: 'scatter3d',
          mode: 'markers',
          marker: {
            size: 5 //videoMetadata ? videoMetadata.duration : 5,
          },
          hovertemplate: "Video Name: %{text}<br>Duration: %{x}<br>Speaker Gender: %{y}<br>Language: %{z}"
        }]}
        style={{ width: '100%', height: '600px', margin: 'auto' }}
        layout={{
          scene: {
            xaxis: {title: 'Duration'},
            yaxis: {title: 'Speaker Gender'}, 
            zaxis: {title: 'Language'}
          }
        }}
        />
    </div>
  )
})

export default MetadataGraph