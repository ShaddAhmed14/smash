'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const TemporalSentimentGraph = memo(function TemporalSentimentGraph({plot_name}) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_temporal_sentiment/"

    const layout={
        xaxis: {title: 'Segment Number', unifiedhovertext: {text: ''}},
        yaxis: {title: 'Sentiment Compound Score'},
        autosize: true,
        hovermode: 'x unified',
        legend: {orientation: 'h', y: -0.2},
        margin: { t: 20, b: 20, l: 50, r: 50}
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
        let number_of_videos = 7
        let traces = []
        for (let i=0; i<number_of_videos; i++) {
            let trace = {
                x: data[i].temporal_segments || [],
                y: data[i].temporal_sentiment || [],
                type: 'scatter',
                mode: 'lines',
                name: data[i].title.split("/").pop().split("_transcript")[0] || `Video ${i+1}`,
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
    <>
    { 
        error ?
        <p className="m-2 text-md">Error loading Data Map plot: {error.toString()}</p>
        :
        <div className="w-full h-9/10">
            <PlotTemplate layout={layout} config={config} data={processedData} name={plot_name} />
        </div>
    }
    </>
)

})

export default TemporalSentimentGraph