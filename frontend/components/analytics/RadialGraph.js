'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const RadialGraph = memo(function RadialGraph() {
    const [data, setData] = useState(null)

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
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_average_audio_features"
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                console.log(data)
                setData(fetchedData)
            })
            .catch(error => {
                console.error("Error fetching average audio features:", error)
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

        // console.log("Data:", avg_tempo, avg_pitch, avg_volume)

        // function normalizeArray(tempo, pitch, volume) {
        //     const globalMin = Math.min(...[...tempo, ...pitch, ...volume])
        //     const globalMax = Math.max(...[...tempo, ...pitch, ...volume])
        //     console.log("Global Min and Max:", globalMin, globalMax)
        //     const normalize = (value) => ((value - globalMin) * 100 / (globalMax - globalMin))
        //     return {
        //         normalized_tempo: tempo.map(normalize),
        //         normalized_pitch: pitch.map(normalize),
        //         normalized_volume: volume.map(normalize)
        //     }
        // }

        // const {normalized_tempo, normalized_pitch, normalized_volume} = normalizeArray(avg_tempo, avg_pitch, avg_volume)


        function normalizeArray(arr) {
            const min = Math.min(...arr)
            const max = Math.max(...arr)
            return arr.map(value => ((value - min)*10) / (max - min))
        }

        const normalized_tempo = normalizeArray(avg_tempo)
        const normalized_pitch = normalizeArray(avg_pitch)
        const normalized_volume = normalizeArray(avg_volume)

        console.log("Normalized Data:", normalized_tempo, normalized_pitch, normalized_volume)

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
            title: {text: 'Radial Graph'},
            autosize: true,
            showlegend:true,
            legend: {orientation: 'h', x: 0, y: -0.2},
        }
        
        return {traces: traces, layout: layout}
    }, [data])

    return (
      <div>
        <PlotTemplate layout={processedData.layout} config={config} data={processedData.traces} />
      </div>
    )

})

export default RadialGraph