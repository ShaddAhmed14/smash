'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'
import { API_ROUTES } from '../../lib/api'

const RadialGraph = memo(function RadialGraph({plot_name}) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Topic Interdistance Map",
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        const url = API_ROUTES.ANALYSIS + "/fetch_average_audio_features"
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
        if (!data) return {}
        const number_of_videos = 7
        const avg_tempo = data.avg_tempo.slice(0, number_of_videos) || []
        const avg_pitch = data.avg_pitch.slice(0, number_of_videos) || []
        let avg_volume = data.avg_volume.slice(0, number_of_videos) || []
        avg_volume = avg_volume.map(v => Math.abs(v))
        const titles = data.titles.slice(0, number_of_videos) || []
        const colors = ['rgba(30, 0, 228, 1)', 'rgba(255, 99, 71, 0.23)']

        function normalizeArray(arr) {
            const min = Math.min(...arr)
            const max = Math.max(...arr)
            return arr.map(value => ((value - min)*10) / (max - min))
        }

        const normalized_tempo = normalizeArray(avg_tempo)
        const normalized_pitch = normalizeArray(avg_pitch)
        const normalized_volume = normalizeArray(avg_volume)


        let traces = []
        for (let i=0; i<number_of_videos; i++) {
            let trace = {
                r: [normalized_pitch[i], normalized_volume[i], normalized_tempo[i]],
                // r: [avg_pitch[i], avg_volume[i], avg_tempo[i]],
                theta: ['Avg Pitch', 'Avg Volume', 'Avg Tempo'],
                type: 'scatterpolar',
                title: titles[i],
                name: titles[i],
                mode: 'lines',
                fill: 'toself',
                color: colors,
                hovertemplate: "Title: %{title}<extra></extra>"
            }
            traces.push(trace)
        }

        const layout={
            autosize: true,
            showlegend:false,
            legend: {orientation: 'h', x: 0, y: -1},
            margin: { t: 0, b: 0, l: 0, r: 0},
        }
        
        return {traces: traces, layout: layout}
    }, [data])

    return (
    <>
    { 
        error ?
        <p className="m-2 text-md">Error loading Data Map plot: {error.toString()}</p>
        :
        <div className="p-3">
        <PlotTemplate layout={processedData.layout} config={config} name={plot_name} data={processedData.traces} />
        </div>
    }
    </>
)

})

export default RadialGraph