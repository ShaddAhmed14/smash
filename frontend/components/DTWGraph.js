'use client'
import { useEffect, useRef, memo, useMemo } from 'react'

const DTWGraph = memo(function DTWGraph({data, selectedVideos=[], layout, config, handleClick }) {
    const plotlyRef = useRef(null)
    const containerRef = useRef(null)
    const isInitialized = useRef(false)

    const processedData = useMemo(() => {
      if (!data) return {}
      console.log("processing data", data)
      let returnData = {
        x: data.x || [],
        y: data.y || [],
        text: data.text || [],
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: data.text?.map((video_name, index) => { return selectedVideos.includes(video_name) ? "red" : "blue" }) || 'blue',
          size: data.text?.map((video_name, index) => { return selectedVideos.includes(video_name) ? 12 : 6 }) || 6,
        },
        hovertemplate: "X: %{x}<br>Y: %{y}<br>Gesture: %{text}"
      }
      console.log("returning", returnData)
      return [returnData]
    }, [data, selectedVideos])

    useEffect(() => {
      const loadPlotly = async () => {
        if(containerRef?.current && processedData.length > 0) {
          try {
            const Plotly = await import('plotly.js-dist-min')
            const PlotlyInstance = Plotly.default || Plotly || window.Plotly
            plotlyRef.current = PlotlyInstance
            if (!isInitialized.current) {
              PlotlyInstance.newPlot(containerRef.current, processedData, layout, config)
              isInitialized.current = true
              containerRef.current.on('plotly_click', handleClick)
            }
          } catch (error) {
            console.error("Error loading Plotly:", error)
          }
      }}
      loadPlotly()
        
  }, [data, layout, config])

  useEffect(() => {
    if(isInitialized.current && plotlyRef?.current && containerRef?.current) {
      const newColors = data.text.map((video_name, index) => { return selectedVideos.includes(video_name) ? "red" : "blue" })
      const newSizes = data.text.map((video_name, index) => { return selectedVideos.includes(video_name) ? 12 : 6 })
      plotlyRef.current.restyle(containerRef.current, {
        'marker.color': [newColors],
        'marker.size': [newSizes]
      }, 0)
    }
  }, [selectedVideos, data])

  useEffect(() => {
    return () => {
          if (containerRef?.current && plotlyRef?.current) {
            plotlyRef.current.purge(containerRef.current)
          isInitialized.current = false
          }
  }}, [])

    return <div ref={containerRef} style={{width: "100%", height: "100%"}}></div>
})

export default DTWGraph