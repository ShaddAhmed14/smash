'use client'

import { useState, useRef, useCallback, createRef } from "react"
import VideoPlayer from "./VideoPlayer"

const VideoAnalysis = ({video_name}) => {
  const models = [
    { id:1, name: "Yolo", isChecked:true},
    { id:2, name: "Mediapipe", isChecked:true},
    { id:3, name: "Openpose", isChecked:true},
    { id:4, name: "MaskanyoneApiMediapipe", isChecked:true},
    { id:5, name: "MaskanyoneApiOpenpose", isChecked:true},
    { id:6, name: "MaskanyoneUiMediapipe", isChecked:true},
    { id:7, name: "MaskanyoneUiOpenpose", isChecked:true},
  ];
  const [checkedItems, setCheckedItems] = useState(models)
  const original_video_ref = useRef(null)
  const videoRefsMap = useRef(new Map())

  const handleCheckboxChange = (id) => {
    setCheckedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      ))}
  
  const getVideoRef = useCallback((modelId) => {
    if (!videoRefsMap.current.has(modelId)) {
      videoRefsMap.current.set(modelId, createRef())
    }
    return videoRefsMap.current.get(modelId)
  }, [])
  const handlePlay = useCallback(() => {
    const originalVideo = original_video_ref.current
    if (!originalVideo) return

    checkedItems.forEach(item => {
      if (item.isChecked) {
        const videoRef = videoRefsMap.current.get(item.id)?.current
        if (videoRef) {
          videoRef.currentTime = originalVideo.currentTime
          videoRef.play().catch(console.error)
        }
      }
    })
  }, [checkedItems])

  // Handle pause - sync all checked videos  
  const handlePause = useCallback(() => {
    checkedItems.forEach(item => {
      if (item.isChecked) {
        const videoRef = videoRefsMap.current.get(item.id)?.current
        if (videoRef) {
          videoRef.pause()
        }
      }
    })
  }, [checkedItems])

  // Handle seek - sync all checked videos
  const handleSeek = useCallback(() => {
    const originalVideo = original_video_ref.current
    if (!originalVideo) return

    checkedItems.forEach(item => {
      if (item.isChecked) {
        const videoRef = videoRefsMap.current.get(item.id)?.current
        if (videoRef) {
          videoRef.currentTime = originalVideo.currentTime
        }
      }
    })
  }, [checkedItems])

  return (
    <div>
      {/*Model Selection*/}
      <div className="flex flex-wrap gap-4 mb-8 p-4 rounded">
        {checkedItems.map((item) => (
          <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={() => handleCheckboxChange(item.id)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">{item.name}</span>
          </label>
        ))}
      </div>
      {/*Video Display*/}
      <div className="grid grid-cols-3 gap-4 m-3">
        <VideoPlayer key={0} ref={original_video_ref} video_name={video_name} model_name={"Original"} handlePause={handlePause} handlePlay={handlePlay} handleSeek={handleSeek}/>
        {checkedItems.map((item) => 
          item.isChecked ? (
            <VideoPlayer key={item.id} ref={getVideoRef(item.id)} video_name={video_name} model_name={item.name}/>
          ) : ""
        )}
      </div>
    </div>
  )
}

export default VideoAnalysis