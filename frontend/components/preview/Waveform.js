'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const Waveform = memo(function Waveform({videoName, currentTime}) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

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
        .then(response => {
        return response.json().then(fetchedData => {
          if (!response.ok) {
            throw new Error(fetchedData.message || response.statusText);
          }
          return fetchedData;
        });
      })
        .then(fetchedData => setData(fetchedData))
        .catch(err => {
        console.error("Fetch error:", err);
        setError(err.message || err.toString());
      })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        if (!('peaks' in data)) {
            setError("No peaks data available")
            return {}
        }
        const peaks = data.peaks
        const currentIndex = (currentTime / data.duration) * peaks.length

        const styles = getComputedStyle(document.documentElement)
        const customRedDark = styles.getPropertyValue('--custom-preview-dark') || 'red'

        let peaksTrace = {
            y: peaks || [],
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
        let mirroredPeaksTrace = {
            y: peaks.map(item => -item) || [],
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
            y: [-Math.max(...peaks), Math.max(...peaks)],
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'blue',
                width: 2,
            },
            hoverinfo: 'skip',

        }
        return [ mirroredPeaksTrace, peaksTrace, timeLine]
    }, [data, currentTime])

    return (
      <div className="flex flex-col">
        <div className="bg-secondary border border-primary flex flex-row items-center justify-between px-4 py-3">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.02em] text-secondary">Audio Waveform</p>
        </div>
        <div className="p-2 w-full h-[85%]">
            {error ? <p className="text-md">Error loading waveform: {error.toString()}</p>
            : <PlotTemplate layout={layout} name="Waveform" config={config} data={processedData} currentTime={currentTime} />
            }
        </div>
      </div>
    )
})

export default Waveform