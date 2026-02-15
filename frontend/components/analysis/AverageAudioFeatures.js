'use client'
import {useEffect, useState, memo, useMemo} from 'react'
import PlotTemplate from '../PlotTemplate'

const AverageAudioFeatures = memo(function AverageAudioFeatures({plot_name}) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    const layout={
    scene: { // needed for 3d plot
        xaxis: {title: {text:'Pitch'}},
        yaxis: {title: {text:'Volume'}},
        zaxis: {title: {text:'Tempo'}},
    },
    autosize: true,
    margin: {l:0, r:0, b:0, t:0}
    }
    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Average Audio Features",
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_average_audio_features"
        fetch(url)
        .then(response => {
        return response.json().then(fetchedData => {
          if (!response.ok) {
            throw new Error(fetchedData.message || response.statusText);
          }
          return fetchedData;
        });
      })
        .then(fetchedData => {
            setData(fetchedData)
        })
        .catch(err => {
            console.error("Fetch error:", err);
            setError(err.message || err.toString());
        })
    }, [])

    const processedData = useMemo(() => {
        if (!data || data == null) return {}
        const styles = getComputedStyle(document.documentElement)
        const pointsColor = styles.getPropertyValue('--points-color')
        
        let returnData = {
            x: data.avg_pitch || [],
            y: data.avg_volume || [],
            z: data.avg_tempo || [],
            text: data.titles || [],
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                color: pointsColor,
                size: 5,
            },
            hovertemplate: "Pitch: %{x}<br>Volume: %{y}<br>Tempo: %{z}<br>Title: %{text}<extra></extra>"
        }
        return [returnData]
    }, [data])

    return (
        <>
        { 
            error ?
            <p className="m-2 text-md">Error loading Average Audio Features plot: {error.toString()}</p>
            :
            <PlotTemplate layout={layout} config={config} data={processedData} name={plot_name} />
        }
        </>
)})

export default AverageAudioFeatures