'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const TemporalSentimentGraph = memo(function TemporalSentimentGraph() {
    const [data, setData] = useState(null)

    const layout={
    title: {text: 'Temporal Sentiment Analysis'},
    xaxis: {title: 'Segment Number', unifiedhovertext: {text: ''}},
    yaxis: {title: 'Sentiment Compound Score'},
    autosize: true,
    hovermode: 'x unified',
    legend: {orientation: 'h', y: -0.2}
    }
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
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_temporal_sentiment/"
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        let trace_1 = {
            x: data[0].temporal_segments || [],
            y: data[0].temporal_sentiment || [],
            type: 'scatter',
            mode: 'lines',
            name: data[0].title || 'Video 1',
            marker: {
                color: 'red',
                size: 6,
            },
            hovertemplate: "Sentiment Score: %{y}<extra></extra>"
        }
        let trace_2 = {
            x: data[1].temporal_segments || [],
            y: data[1].temporal_sentiment || [],
            type: 'scatter',
            mode: 'lines',
            name: data[1].title || 'Video 2',
            marker: {
                color: 'blue',
                size: 6,
            },
            hovertemplate: "Sentiment Score: %{y}<extra></extra>"
        }
        return [trace_1, trace_2]
    }, [data])

    return (
      <div>
        <PlotTemplate layout={layout} config={config} data={processedData} />
      </div>
    )

})

export default TemporalSentimentGraph