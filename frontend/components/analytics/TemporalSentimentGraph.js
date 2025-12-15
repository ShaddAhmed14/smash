'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const TemporalSentimentGraph = memo(function TemporalSentimentGraph({plot_name}) {
    const [data, setData] = useState(null)
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_temporal_sentiment/"

    const layout={
        xaxis: {title: 'Segment Number', unifiedhovertext: {text: ''}},
        yaxis: {title: 'Sentiment Compound Score'},
        autosize: true,
        hovermode: 'x unified',
        legend: {orientation: 'h', y: -0.2},
        margin: { t: 0, b: 40, l: 50, r: 20}
    }

    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: plot_name,
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        let number_of_videos = 7
        let traces = []
        for (let i=0; i<number_of_videos; i++) {
            let trace = {
                x: data[i].temporal_segments || [],
                y: data[i].temporal_sentiment || [],
                type: 'scatter',
                mode: 'lines',
                name: data[i].title || `Video ${i+1}`,
                marker: {
                    size: 6,
                },
                hovertemplate: "Sentiment Score: %{y}<extra></extra>"
            }
            traces.push(trace)
            }
        
        return traces
    }, [data])

    return (
      <div>
        <PlotTemplate layout={layout} config={config} data={processedData} name={plot_name} />
      </div>
    )

})

export default TemporalSentimentGraph