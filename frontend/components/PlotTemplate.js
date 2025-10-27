'use client'
import {useEffect, useRef, memo} from 'react'

const PlotTemplate = memo(function PlotTemplate({layout, config, data}) {
    const plotlyRef = useRef(null)
    const containerRef = useRef(null)
    const isInitialized = useRef(false)

    useEffect(() => {
      const loadPlotly = async () => {
        if(containerRef?.current && data.length > 0) {
          try {
            const Plotly = await import('plotly.js-dist-min')
            const PlotlyInstance = Plotly.default || Plotly || window.Plotly
            plotlyRef.current = PlotlyInstance
            if (!isInitialized.current) {
              PlotlyInstance.newPlot(containerRef.current, data, layout, config)
              isInitialized.current = true
            }
          } catch (error) {
            console.error("Error loading Plotly:", error)
          }
      }}
      loadPlotly()
        
    }, [data, layout, config])

    useEffect(() => {
    return () => {
          if (containerRef?.current && plotlyRef?.current) {
            plotlyRef.current.purge(containerRef.current)
          isInitialized.current = false
          }
    }}, [])

     return <div ref={containerRef} style={{width: "100%", height: "100%"}}></div>

})

export default PlotTemplate