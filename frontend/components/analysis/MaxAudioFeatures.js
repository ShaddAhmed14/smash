'use client'
import {useEffect, useState, memo, useMemo} from 'react'
import PlotTemplate from '../PlotTemplate'

const MaxAudioFeatures = memo(function MaxAudioFeatures() {
    const [data, setData] = useState(null)
    const layout={
    title: {text: 'Max Audio Features'},
    scene: { // needed for 3d plot
        xaxis: {title: {text:'Pitch'}},
        yaxis: {title: {text:'Volume'}},
        zaxis: {title: {text:'Tempo'}},
    },
    autosize: true,
    margin: {l:0, r:0, b:0, t:30}
    }
    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Max Audio Features",
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_max_audio_features"
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
            .catch(error => {
                console.error("Error fetching max audio features:", error)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data || data == null) return {}
        
        let returnData = {
            x: data.max_pitch || [],
            y: data.max_volume || [],
            z: data.max_tempo || [],
            text: data.titles || [],
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                color: 'blue',
                size: 5,
            },
            hovertemplate: "Pitch: %{x}<br>Volume: %{y}<br>Tempo: %{z}<br>Title: %{text}<extra></extra>"
        }
        return [returnData]
    }, [data])

    return (
        <div className="w-1/2 h-full">
            <PlotTemplate name="Max Audio Features" layout={layout} config={config} data={processedData} />
        </div>
    )
})

export default MaxAudioFeatures