'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const Waveform = memo(function Waveform({videoName, videoRef}) {
    const [data, setData] = useState(null)
    const [currentTime, setCurrentTime] = useState(5)

    const axis_layout = {showgrid: false, showticklabels: false}
    const layout={
    title: false, 
    xaxis: axis_layout,
    yaxis: axis_layout,
    autosize: true,
    showlegend: false,
    margin: {l: 20, r: 20, t: 20, b: 20}
    }
    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Waveform",
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        if(!videoRef.current) return
        const video = videoRef.current
        const timeUpdateHandler = () => {
            setCurrentTime(video.currentTime)
        }
        video.addEventListener('timeupdate', timeUpdateHandler)
        return () => {
            video.removeEventListener('timeupdate', timeUpdateHandler)
        }
    }, [videoRef])

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/audio_peaks?video_name=" + videoName
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        const videoDuration = videoRef?.current?.duration || data.length
        const currentIndex = (currentTime / videoDuration) * data.length

        let peaks = {
            y: data || [],
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red',
                width: 1,
            },
            fill: 'tozeroy',
          hoverinfo: 'skip',
      fillcolor: 'rgba(255, 0, 0, 0.5)',
        }        
        let mirrored_peaks = {
            y: data.map(item => -item) || [],
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red',
                width: 1,
            },
            fill: 'tonexty',
                hoverinfo: 'skip',

            fillcolor: 'rgba(255, 0, 0, 0.5)',

        }
        let timeLine = {
            x: [currentIndex, currentIndex],
            y: [-Math.max(...data), Math.max(...data)],
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'blue',
                width: 2,
            },
            hoverinfo: 'skip',

        }
        return [ mirrored_peaks, peaks, timeLine]
    }, [data, currentTime])

    return (
      <div className="w-full h-full">
        <PlotTemplate layout={layout} config={config} data={processedData} currentTime={currentTime} />
      </div>
    )

})

export default Waveform