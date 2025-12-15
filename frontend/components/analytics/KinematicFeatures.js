'use client'

import { useEffect, useState, memo, Suspense, useCallback } from "react"
import {Grid} from 'react-window'
// import KinematicFeaturesGraph from "./KinematicFeaturesGraph"
import PlotTemplate from "../PlotTemplate"

const KinematicFeatures = memo(function KinematicFeatures() {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + '/fetch_kinematic_features'
  const gesture_segment_url = process.env.NEXT_PUBLIC_BACKEND_URL  + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_gesture_segment/?video_name="
  const [data, setData] = useState(null)
  const [videos, setVideos] = useState([null, null])
  // const [selectedFeature, setSelectedFeature] = useState(null)
  
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData({"gesture_ids": data.gesture_ids, "features": data.features, "jitter_values": data.jitter_values})
        // setSelectedFeature(Object.keys(data.features))
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

  // const handleClick = (feature_name) => {
  //   if (feature_name === "all") {
  //     setSelectedFeature(Object.keys(data.features))
  //     return
  //   }
  //   if(!selectedFeature) {
  //     setSelectedFeature([feature_name])
  //     return
  //   }
  //   if(selectedFeature.includes(feature_name)) {
  //     setSelectedFeature(selectedFeature.filter(item => item !== feature_name))
  //   }
  //   else {
  //     setSelectedFeature([...selectedFeature, feature_name])
  //   }
  // }

  // const featureEntries = data ? Object.entries(data.features) : []
  // const columnCount = 2
  // const rowCount = Math.ceil(featureEntries.length / columnCount)

  // function cellComponent ({feature, jitter_values, gesture_ids, columnIndex, rowIndex, style}) {
  //   // const {featureEntries, jitter_values, gesture_ids} = data
  //   const index = rowIndex * columnCount + columnIndex
  //   if (index >= feature.length) {
  //   // if (index >= 5) {
  //     return null
  //   }
  //   const [feature_name, feature_values] = feature[index]
  //   const layout={
  //   autosize: true,
  //   showlegend: false,
  //   margin: { t: 50, r: 20, b: 25, l: 50 },
  //   violinmode: 'overlay',
  //   yaxis: { autorange: true, title: {text: feature_name}, zeroline: true },
  //   xaxis: {zeroline: true}
  //   }
  //   const config = {
  //   responsive: true,
  //   displayModeBar: true,
  //   modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  //   displaylogo: false,
  //   toImageButtonOptions: {
  //     format: 'png',
  //     filename: feature_name + "_Kinematic_Feature",
  //     height: 500,
  //     width: 700,
  //     scale: 1
  //   }
  //   }
  //   const traces = [
  //     {
  //       type: 'scatter',
  //       mode: 'markers',
  //       x: data.jitter_values,
  //       y: feature_values,
  //       text: gesture_ids,
  //       marker: {
  //         color: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? "red" : "blue" }) || 'blue',
  //         size: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? 12 : 6 }) || 6,
  //       },
  //       hovertemplate: '<b>Title:</b> %{text}<br><b>X:</b> %{x}<br><b>Y:</b> %{y}<extra></extra>'
  //     },
  //     {
  //       type: 'violin',
  //       y: feature_values,
  //       x0:0,
  //       opacity: 0.7,
  //       fillcolor: "rgba(100, 100, 100, 0.2)",
  //       line: { color: 'rgba(100, 100, 100, 0.5)' },
  //       box: { visible: false },
  //       meanline: { visible: true },
  //       points: false,
  //       hoverinfo: 'skip',
  //       side: 'both',
  //       width: 2, 
  //       scalemode: 'width'
  //     },
  //     {
  //       type: 'box',
  //       y: feature_values,
  //       x0:0,
  //       name: 'Statistics',
  //       boxpoints: false,
  //       fillcolor: 'rgba(255,255,255,0)',
  //       line: { color: "rgba(0, 0, 0, 0.8)", width: 2 },
  //       marker: { 
  //         color: "rgba(0, 0, 0, 0.8)",
  //         size: 4
  //       },
  //       whiskerwidth: 0.3,
  //       width: 0.3,
  //       hoverinfo: 'skip'
  //     }
  //   ] 
  //   return (
  //     <Suspense fallback={<div>Loading {feature_name}...</div>}>
  //     <div key={index} style={style} className="m-2">
  //       <PlotTemplate layout={layout} config={config} data={traces} name={feature_name} handleClick={handleClickVideo} selectedVideos={videos} />
  //     </div>
  //     </Suspense>
  //   )
  // }
  
  
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
    const trace_1 = {
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
    <div className="h-full w-full flex flex-row justify-center items-center gap-2">
      <div className="w-[70%] h-full grid grid-cols-2 gap-2 overflow-y-auto border border-primary rounded-lg object-contain overflow-hidden">
        {
            data ?
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
            : <div>No Data...</div>
          }
      </div>
      <div className="flex flex-col items-center gap-y-2 justify-evenly w-[25%]">
          {videos[0] ? 
            <div className="w-full rounded-lg border border-primary">
              <video className="object-contain rounded-lg max-w-full h-auto" loop src={gesture_segment_url+videos[0]} controls /> 
              <p className="break-words text-xs p-2">{videos[0]}</p>
            </div> : <p>Select upto 2 Videos to Preview</p>
          }
          {videos[1] ? 
          <div className="w-full rounded-lg border border-primary">
            <video className="object-contain rounded-lg max-w-full h-auto" loop src={gesture_segment_url+videos[1]} controls /> 
            <p className="break-words text-xs p-2">{videos[1]}</p>
          </div> : null
          }
      </div>
    </div>
  )
})

export default KinematicFeatures
{/* {data ? 
  <Grid className="h-full" columnCount={columnCount} columnWidth={'45%'} rowCount={rowCount} rowHeight={300} height="100%" width="100%"
  cellComponent={cellComponent} cellProps={{feature: featureEntries, jitter_values: data.jitter_values, gesture_ids: data.gesture_ids}} /> 
  : null} */}