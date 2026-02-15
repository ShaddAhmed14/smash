'use client'

import { useEffect, useState, memo, Suspense, useCallback } from "react"
import PlotTemplate from "../PlotTemplate"
import { API_ROUTES } from '../../lib/api'

const KinematicFeatures = memo(function KinematicFeatures() {
  const url = API_ROUTES.ANALYTICS + '/fetch_kinematic_features'
  const gesture_segment_url = API_ROUTES.ANALYTICS + "/fetch_gesture_segment/?video_name="
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [videos, setVideos] = useState([null, null])
  
  useEffect(() => {
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
          setData({"gesture_ids": fetchedData.gesture_ids, "features": fetchedData.features, "jitter_values": fetchedData.jitter_values})
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError(err.message || err.toString());
      })
  }, [])

  const handleClickVideo = useCallback((e) => {
    if (e.points[0].curveNumber !== 0) return // only respond to 1st trace
    
    const video_name = e.points[0]?.text
    setVideos(prev => {
      if (prev.includes(video_name)) {
        return prev.filter(v => v !== video_name) // remove video 
      }
      else if (prev.length >= 2) {
        return [prev[1], video_name] // replace the first video if 2 are already selected
      }
      else {
        return [...prev, video_name] // add the new video
        }
  })}, [])

  const return_params = ({feature_name, feature_values, jitter_values, gesture_ids}) => {
    const layout={
    autosize: true,
    showlegend: false,
    margin: { t: 50, r: 20, b: 25, l: 50 },
    violinmode: 'overlay',
    yaxis: { autorange: true, zeroline: true, title: {text: feature_name} },
    xaxis: {zeroline: true},
    margin: {t:0, b:40, l:40, r:0}
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
    const styles = getComputedStyle(document.documentElement)
    const pointsColor = styles.getPropertyValue('--points-color')
    const customAnalyticsDark = styles.getPropertyValue('--custom-analytics-dark')
    const trace_1 = {
      type: 'scatter',
      mode: 'markers',
      x: jitter_values,
      y: feature_values,
      text: gesture_ids,
      marker: {
        color: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? customAnalyticsDark : pointsColor }) || pointsColor,
        size: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? 12 : 6 }) || 6,
      },
      hovertemplate: '<b>Title:</b> %{text}<br><b>X:</b> %{x}<br><b>Y:</b> %{y}<extra></extra>'
    }
    const trace_2 = {
        type: 'violin',
        x0:0,
        y: feature_values,
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
      }
    const trace_3 = {
        type: 'box',
        x0:0,
        y: feature_values,
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
    return {layout, config, traces: [trace_1, trace_2, trace_3]}
  }

  return (
    <>
    {
      error ?
      <p className="m-2 text-md">Error loading Kinematic Features plots: {error.toString()}</p>
      :
      <div className="plot-container-plot-video">
        <div className="plot-container-plot grid grid-cols-2 gap-2 overflow-y-scroll">
          {
              data &&
              Object.entries(data.features).map(([feature_name, feature_values], index) => {
                const {layout, config, traces} = return_params({feature_name, feature_values, jitter_values: data.jitter_values, gesture_ids: data.gesture_ids})
                return(
                  <div className="min-h-[300px] mx-1" key={index}>
                    <Suspense fallback={<div>Loading {feature_name}...</div>}>
                      <PlotTemplate layout={layout} config={config} data={traces} name={feature_name} handleClick={handleClickVideo} selectedVideos={videos} />
                    </Suspense> 
                  </div>
                )
              })
            }
        </div>
        <div className="video-panel">
            {videos[0] ?
            <Suspense fallback={<div>Loading Video...</div>}>
              <div className="video-panel-video-container">
                <video className="video-panel-video" loop src={gesture_segment_url+videos[0]} controls /> 
                <p className="video-panel-text">{videos[0]}</p>
              </div> 
              </Suspense> : <p>Select upto 2 Videos to Preview</p>
            }
            {videos[1] ? 
            <Suspense fallback={<div>Loading Video...</div>}>
            <div className="video-panel-video-container">
              <video className="video-panel-video" loop src={gesture_segment_url+videos[1]} controls /> 
              <p className="video-panel-text">{videos[1]}</p>
            </div> 
            </Suspense> : null
            }
        </div>
      </div>
    }
    </>
    )
})

export default KinematicFeatures