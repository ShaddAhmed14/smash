'use client'

import { useEffect, useState, memo, Suspense, useCallback } from "react"
import {Grid} from 'react-window'
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
        console.log(data)
        setData({"gesture_ids": data.gesture_ids, "features": data.features, "jitter_values": data.jitter_values})
        // setSelectedFeature(Object.keys(data.features))
      })
  }, [])

  const handleClickVideo = useCallback((e) => {
    if (e.points[0].curveNumber !== 2) return // only respond to scatter plot clicks
    
    const video_name = e.points[0]?.text
    console.log("clicked", video_name, "prev", videos, e.points[0].curveNumber)
    setVideos(prev => {
      if (prev.includes(video_name)) {
        console.log("if removing video", video_name, e.points[0].curveNumber)
        return prev.filter(v => v !== video_name) // remove video 
      }
      else if (prev.length >= 2) {
        console.log("else if adding video", video_name, e.points[0].curveNumber)
        return [prev[1], video_name] // replace the first video if 2 are already selected
      }
      else {
        console.log("else adding video", video_name, e.points[0].curveNumber)
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

  const featureEntries = data ? Object.entries(data.features) : []
  const columnCount = 2
  const rowCount = Math.ceil(featureEntries.length / columnCount)

  function cellComponent ({feature, jitter_values, gesture_ids, columnIndex, rowIndex, style}) {
    // const {featureEntries, jitter_values, gesture_ids} = data
    const index = rowIndex * columnCount + columnIndex
    if (index >= feature.length) {
    // if (index >= 5) {
      return null
    }
    const [feature_name, feature_values] = feature[index]
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
      },
      {
        type: 'scatter',
        mode: 'markers',
        x: data.jitter_values,
        y: feature_values,
        text: gesture_ids,
        marker: {
          color: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? "red" : "blue" }) || 'blue',
          size: gesture_ids?.map((video_name, index) => { return videos.includes(video_name) ? 12 : 6 }) || 6,
        },
        hovertemplate: '<b>Title:</b> %{text}<br><b>X:</b> %{x}<br><b>Y:</b> %{y}<extra></extra>'
      }
    ] 
    return (
      <Suspense fallback={<div>Loading {feature_name}...</div>}>
      <div key={index} style={style} className="m-2">
        <PlotTemplate layout={layout} config={config} data={traces} handleClick={handleClickVideo} selectedVideos={videos} />
        {/* <KinematicFeaturesGraph 
        data={{x: jitter_values, y: feature_values}} 
        title={feature_name}
        labels={{x: "Jitter Values", y: feature_name}}
        gesture_ids={gesture_ids}
        handleClick={handleClickVideo}
        selectedVideos={videos}
      /> */}
    </div>
      </Suspense>
    )
  }

  return (
    <div className="h-full flex flex-row justify-even">
      <div className="w-2/3 h-full m-2">
        {data ? 
        <Grid className="" columnCount={columnCount} columnWidth={300} rowCount={rowCount} rowHeight={300} height="100%" width="100%"
        cellComponent={cellComponent} cellProps={{feature: featureEntries, jitter_values: data.jitter_values, gesture_ids: data.gesture_ids}} /> : null}
      </div>
      <div className="flex flex-col items-center  gap-y-4 align-middle justify-center w-1/3 m-2">
          {videos[0] ? <video loop title={videos[0]} src={gesture_segment_url+videos[0]} controls /> : <p>Select upto 2 Videos to Preview</p>}
          {videos[1] ? <video loop title={videos[1]} src={gesture_segment_url+videos[1]} controls /> : <p></p>}
      </div>
    </div>
  )
})

export default KinematicFeatures


{/* <div>
            <input type="checkbox" onClick={() => handleClick("all")}></input>
            <label>Check All</label>
        </div> */}
      {/* <div className="grid grid-cols-4 gap-1 overflow-auto">
        {
        data ? 
        Object.entries(data.features).map(([feature_name, feature_values], index) => (
          <div key={feature_name}>
            <input type="checkbox" onClick={() => handleClick(feature_name)}></input>
            <label>{feature_name}</label>
          </div>
        )): null
        }      
      </div>
      <div>{selectedFeature ? selectedFeature.join(", ") : ""}</div> */}
      {/* <div className="grid grid-cols-3 gap-1 overflow-y-scroll">
        {
          selectedFeature ?
          Object.entries(data.features).map(([feature_name, feature_values], index) =>
          {
            return(
              
              selectedFeature.includes(feature_name) ?
              <div key={index} className="">
              <Suspense fallback={<div>Loading {feature_name}...</div>}>
                <KinematicFeaturesGraph 
                  data={{x: data.jitter_values, y: feature_values}} 
                  title={feature_name}
                  labels={{x: "Jitter Values", y: feature_name}}
                  gesture_ids={data.gesture_ids}
                />
              </Suspense>
          </div> 
          : null
            )
}) 
: null
        }
      </div> */}

          //   const layout={
          //   title: {text: feature_name},
          //   autosize: true,
          //   showlegend: false
          //   }
          //   const config = {
          //     responsive: true,
          //     displayModeBar: true,
          //     modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          //     displaylogo: false,
          //     toImageButtonOptions: {
          //       format: 'png',
          //       filename: feature_name + "_Kinematic_Feature",
          //       height: 500,
          //       width: 700,
          //       scale: 1
          //     }
          //   }
          //   const traces = [
          //   {
          //     type: 'violin',
          //     y: feature_values,
          //     x0:0,
          //     opacity: 0.7,
          //     fillcolor: "rgba(100, 100, 100, 0.2)",
          //     line: { color: 'rgba(100, 100, 100, 0.5)' },
          //     box: { visible: false },
          //     meanline: { visible: true },
          //     points: false,
          //     hoverinfo: 'skip',
          //     side: 'both'
          //   },
          //   {
          //     type: 'box',
          //     y: feature_values,
          //     x0:0,
          //     name: 'Statistics',
          //     boxpoints: false,
          //     fillcolor: 'rgba(255,255,255,0)',
          //     line: { color: "rgba(0, 0, 0, 0.8)", width: 2 },
          //     marker: { 
          //       color: "rgba(0, 0, 0, 0.8)",
          //       size: 4
          //     },
          //     whiskerwidth: 0.3,
          //     width: 0.3,
          //     hoverinfo: 'skip'
          //   },
          //   {
          //     type: 'scatter',
          //     mode: 'markers',
          //     x: data.jitter_values,
          //     y: feature_values,
          //     text: data.gesture_ids,
          //     marker: { 
          //       size: 6, 
          //       color: "rgba(200, 200, 200, 0.7)",
          //       opacity: 0.7,
          //       line: {
          //         color: 'white',
          //         width: 1
          //       }
          //     },
          //     hovertemplate: '<b>Title:</b> %{text}<br><b>X:</b> %{x}<br><b>Y:</b> %{y}<extra></extra>'
          //   }
          // ]

            // return (
  //   // <div className="grid grid-cols-3 gap-4">
  //   <>
  //     {
  //       data ? 
  //       <Grid columnCount={columnCount} columnWidth={500} rowCount={rowCount} rowHeight={400} height={800} width="100%"
  //       cellComponent={cellComponent} cellProps={{feature: featureEntries, jitter_values: data.jitter_values, gesture_ids: data.gesture_ids}} />
  //       : null
  //     }
  //   </>
  // )