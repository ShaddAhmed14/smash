'use client'
import {useEffect, useState, useRef, memo} from 'react'
import {useTheme} from 'next-themes'
import Loader from './Loader'

// Note: Make sure your primary trace is index 0 for selectedVideos highlighting to work correctly

const PlotTemplate = memo(function PlotTemplate({layout, config, data, name=null,  handleClick=null, selectedVideos=[], currentTime=null}) {
    const plotlyRef = useRef(null)
    const containerRef = useRef(null)
    const isInitialized = useRef(false)
    const [loading, setLoading] = useState(false)
    const {theme} = useTheme()

    const updateLayoutForTheme = (layout, theme) => {
      const styles = getComputedStyle(document.documentElement)
      const textPrimary = styles.getPropertyValue('--text-primary').trim()
      const borderSecondary = styles.getPropertyValue('--border-secondary').trim()
      const bgSecondary = styles.getPropertyValue('--bg-secondary').trim()
      const fontPlexSans = styles.getPropertyValue('--font-family-sans').trim()
      const fontConfig = { 
        color: textPrimary,
        family: fontPlexSans,
        size: 12
      } //test

      layout.paper_bgcolor = bgSecondary
      layout.plot_bgcolor = bgSecondary
      layout.font = fontConfig
      layout.legend = { ...layout.legend, font: fontConfig }
      layout.hoverlabel = {
        ...layout.hoverlabel,
        bgcolor:bgSecondary,
        bordercolor:borderSecondary,
        font: fontConfig,
        namelength: -1
      }
      layout.polar = {
        ...layout.polar,
        bgcolor: bgSecondary,
        radialaxis: {
          gridcolor: borderSecondary,
          tickcolor: textPrimary,
          tickfont: fontConfig
        },
        angularaxis: { 
          gridcolor: borderSecondary,
          tickcolor: textPrimary,
          tickfont: fontConfig
        }
      }
      return layout
    }

    useEffect(() => {
      const loadPlotly = async () => {
        if(containerRef?.current && data && data.length > 0) {
          try {
            setLoading(true)
            const Plotly = await import('plotly.js-dist-min')
            const PlotlyInstance = Plotly.default || Plotly || window.Plotly
            plotlyRef.current = PlotlyInstance
            if (PlotlyInstance != null) {
              const updatedLayout = updateLayoutForTheme({...layout}, theme)
              await PlotlyInstance.react(containerRef.current, data, updatedLayout, config)
              setLoading(false)
            }
            if (!isInitialized.current && handleClick) {
                containerRef.current.on('plotly_click', handleClick)
              isInitialized.current = true
            }
          } catch (error) {
            console.error("Error loading Plotly:", error)
            setLoading(false)
          }
      }}
      loadPlotly()
    }, [data, layout, config, currentTime, theme])

    useEffect(() => {
      if (data && selectedVideos.length > 0 && plotlyRef?.current && containerRef?.current) {
      const newColors = data[0].text.map((video_name, index) => { return selectedVideos.includes(video_name) ? "red" : (data[0].marker.color[index] || data[0].marker.color) })
      const newSizes = data[0].text.map((video_name, index) => { return selectedVideos.includes(video_name) ? 12 : 6 })
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
          }
    }}, [])

     return (
     <>
      {loading ? <Loader name={name}/> : null}
     <div ref={containerRef} style={{width: "100%", height: "100%"}}></div>
     </>
     )
})

export default PlotTemplate