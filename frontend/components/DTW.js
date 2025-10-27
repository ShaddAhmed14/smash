'use client'
import { useState, useEffect, memo, useRef } from 'react'
import DTWGraph from './DTWGraph'

const DTW = memo(function DTW() {
  const [dtwData, setDtwData] = useState(null)
  const [videos, setVideos] = useState([null, null])
  const videoRef1 = useRef(null)
  const videoRef2 = useRef(null)

  const layout={
    title: {text: 'Dynamic Time Warping (DTW) Analysis'},
    xaxis: {title: 'x'},
    yaxis: {title: 'y'},
    autosize: true,
  }

  let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_gesture_segment/?video_name="

  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_dtw/"
    fetch(url)
      .then(response => response.json())
      .then(data => {
          const graph_data={
                x: data.x || [],
                y: data.y || [],
                text: data.gesture || [],
                }
        console.log("fetched data", graph_data)
        setDtwData(graph_data)
      })
  }, [])

  const handleClick = (e) => {
    console.log("clicked")
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

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "DTW Graph",
      height: 500,
      width: 700,
      scale: 1
    }
  }
  return (
    <div className="flex flex-row h-full w-full justify-between">
        {dtwData ? 
        <div className="w-2/3">
          <DTWGraph data={dtwData} selectedVideos={videos} config={config} layout={layout} handleClick={handleClick} />
        </div>
            : <div>Loading DTW Graph...</div>
          }
        <div className="flex flex-col items-center  gap-y-4 align-middle justify-center w-1/3">
            {videos[0] ? <video loop title={videos[0]} ref={videoRef1} src={url+videos[0]} controls /> : <p>Select upto 2 Videos to Preview</p>}
            {videos[1] ? <video loop e={videos[1]} ref={videoRef2} src={url+videos[1]} controls /> : <p></p>}
        </div>
    </div>
  )
})

export default DTW