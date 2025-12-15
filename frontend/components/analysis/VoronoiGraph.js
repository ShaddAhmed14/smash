'use client'
import { useState, useEffect, memo, useMemo } from 'react'
import PlotTemplate from '../PlotTemplate'

const VoronoiGraph = memo(function VoronoiGraph({plot_name}) {
    let spectrogram_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_spectogram?video_name="
  const [data, setData] = useState(null)
  const [videos, setVideos] = useState([null, null])
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_audio_spectogram_embeddings"

  const axis_layout = {showtickLabels: false, zeroline: false, showgrid: false, title:''}
  const layout={
    xaxis: axis_layout,
    yaxis: axis_layout,
    autosize: true,
    showlegend: false,
    margin: {l:0, r:0, b:0, t:0}
  }
  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Audio Spectrogram Embeddings",
      height: 500,
      width: 700,
      scale: 1
    }
  }

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => setData(data))
  }, [])

  const handleClick = (e) => {
    const video_name = e.points[0]?.text
    setVideos(prev => {
      if (prev.includes(video_name)) {
        return prev.filter(v => v !== video_name) // remove video 
      }
      else if (prev.length >= 2) {
        return [prev[1], video_name] // replace the first video if 2 are already selected
      }
      else return [...prev, video_name] // add the new video
  })}

  const getVoronoiRegions = (regions_by_label, labelToColor) => {
    const traces = []
    for (const [label, regionsList] of Object.entries(regions_by_label)) {
        // const color = labelToColor[intparse(label)] || 'white'
        for (const [pointIdx, ploygon] of regionsList) {
            if (ploygon.length < 3) continue
            const polyX = [...ploygon.map(p => p[0]), ploygon[0][0]]
            const polyY = [...ploygon.map(p => p[1]), ploygon[0][1]]
            traces.push({
                x: polyX,
                y: polyY,
                fill: 'toself',
                fillcolor: labelToColor[parseInt(label)],
                line: {color: 'black'},
                opacity: 0.2,
                type: 'scatter',
                mode: 'lines',
                hoverinfo: 'skip',
                hovertemplate: null,
            })
        }
    }
    return traces
}
  const processedData = useMemo(() => {
      if (!data) return {}
      const labelToColor = {
        0: 'rgba(101, 0, 0, 1)',
        1: 'rgba(0, 118, 0, 1)',
        2: 'rgba(0, 0, 95, 1)',
        3: 'rgba(177, 177, 0, 1)',
        4: 'rgba(0, 192, 192, 1)',
      }

      let dataPoints = {
        x: data.coords_2d.map(coord => coord[0]) || [],
        y: data.coords_2d.map(coord => coord[1]) || [],
        text: data.filenames || [],
        customdata: data.labels || [],
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: data.labels.map(label => labelToColor[parseInt(label)]) || 'blue',
          size: data.filenames?.map((video_name, index) => { return videos.includes(video_name) ? 12 : 6 }) || 6,
        },
        hovertemplate: "X: %{x}<br>Y: %{y}<br>Name: %{text}<br>Label: %{customdata}<extra></extra>",
        // showlegend: false,
      }
      let dataRegions = getVoronoiRegions(data.regions_by_label, labelToColor)

      return [dataPoints, ...dataRegions]
    //   return [dataPoints]
    }, [data, videos])

  return (
    <div className="plot-container-plot-video">
      <div className="plot-container-plot">
        <PlotTemplate name={plot_name} layout={layout}  config={config} data={processedData} handleClick={handleClick} selectedVideos={videos} />
      </div>
      <div className="plot-container-video">
            {videos[0] ? 
            <div className="w-full rounded-lg border border-primary">
              <img className="object-contain rounded-lg max-w-full h-auto" src={spectrogram_url+videos[0]} /> 
              <p className="break-words text-xs p-2">{videos[0]}</p>
            </div> : <p>Select upto 2 Spectograms to Preview</p>
            }
            {videos[1] ? 
            <div className="w-full rounded-lg border border-primary">
              <img className="object-contain rounded-lg max-w-full h-auto" src={spectrogram_url+videos[1]} /> 
              <p className="break-words text-xs p-2">{videos[1]}</p>
            </div> : null
            }
        </div>
    </div>
  )
})

export default VoronoiGraph