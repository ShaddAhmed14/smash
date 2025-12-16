'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const Waveform = memo(function Waveform({videoName, currentTime}) {
    console.log("Waveform render:", videoName, currentTime)
    const [data, setData] = useState(null)
    // const [currentTime, setCurrentTime] = useState(5)

    const axis_layout = {showgrid: false, showticklabels: false}
    const layout={
    title: false, 
    xaxis: axis_layout,
    yaxis: axis_layout,
    autosize: true,
    showlegend: false,
    margin: {l: 0, r: 0, t: 0, b: 0}
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
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/audio_peaks?video_name=" + videoName
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        const videoDuration = data.length
        const currentIndex = (currentTime / videoDuration) * data.length

        const styles = getComputedStyle(document.documentElement)
        const customRedDark = styles.getPropertyValue('--custom-preview-dark') || 'red'

        let peaks = {
            y: data || [],
            type: 'scatter',
            mode: 'lines',
            line: {
                color: customRedDark,
                width: 1,
            },
            fill: 'tozeroy',
        //   hoverinfo: 'skip',
        hovertemplate: 'Time: %{x}<br>Amplitude: %{y}',
      fillcolor: `${customRedDark}100`,
        }        
        let mirrored_peaks = {
            y: data.map(item => -item) || [],
            type: 'scatter',
            mode: 'lines',
            line: {
                color: customRedDark,
                width: 1,
            },
            fill: 'tonexty',
        hovertemplate: 'Time: %{x}<br>Amplitude: %{y}',

            fillcolor: `${customRedDark}100`,

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
      <div className="flex flex-col ">
        <div className="bg-secondary border border-primary flex flex-row items-center justify-between px-4 py-3">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.02em] text-secondary">Audio Waveform</p>
        </div>
        <div className="p-2 w-full h-full ">
            <PlotTemplate layout={layout} name="Waveform" config={config} data={processedData} currentTime={currentTime} />
        </div>
      </div>
    )

})

export default Waveform