'use client'

import { useEffect, useState, memo, useRef, Suspense, useCallback } from "react"
import PlotTemplate from "../PlotTemplate"

const KinematicFeaturesGraph = memo(function KinematicFeaturesGraph ({feature_name, feature_values, jitter_values, gesture_ids, videos, handleClickVideo}) {
    const [hasLoaded, setHasLoaded] = useState(false)
    const containerRef = useRef(null)

    const layout={
    autosize: true,
    showlegend: false,
    margin: { t: 50, r: 20, b: 25, l: 50 },
    violinmode: 'overlay',
    yaxis: { autorange: true, title: {text: feature_name}, zeroline: true },
    xaxis: {zeroline: true}
    }
    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: feature_name + "_Kinematic_Feature",
      height: 500,
      width: 700,
      scale: 1
    }
    }
    const traces = [
      {
        type: 'scatter',
        mode: 'markers',
        x: jitter_values,
        y: feature_values,
        text: gesture_ids,
        marker: {
          color: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? "red" : "blue" }) || 'blue',
          size: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? 12 : 6 }) || 6,
        },
        hovertemplate: '<b>Title:</b> %{text}<br><b>X:</b> %{x}<br><b>Y:</b> %{y}<extra></extra>'
      },
      {
        type: 'violin',
        y: feature_values,
        x0:0,
        opacity: 0.7,
        fillcolor: "rgba(100, 100, 100, 0.2)",
        line: { color: 'rgba(100, 100, 100, 0.5)' },
        box: { visible: false },
        meanline: { visible: true },
        points: false,
        hoverinfo: 'skip',
        side: 'both',
        width: 2, 
        scalemode: 'width'
      },
      {
        type: 'box',
        y: feature_values,
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
        hoverinfo: 'skip'
      }
    ] 

    useEffect(() => {
        const observor = new IntersectionObserver(
            ([entry]) => {
            if(entry.isIntersecting && !hasLoaded) setHasLoaded(true)
        }, {threshold: 0.1, rootMargin: "100px"})
        
        if(containerRef.current){
            observor.observe(containerRef.current)
        }
        return () => {
            if(containerRef.current){
                observor.disconnect()
            }
        }
    }, [hasLoaded])

    if (!hasLoaded) {
        return <div>Loading...</div>
    }

  return (
    <div ref={containerRef} key={feature_name} className="m-2">
        <PlotTemplate layout={layout} config={config} data={traces} name={feature_name} handleClick={handleClickVideo} selectedVideos={videos} />
    </div>
  )
})

export default KinematicFeaturesGraph