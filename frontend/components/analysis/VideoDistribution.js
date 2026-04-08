'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'
import { API_ROUTES } from '../../lib/api'

const VideoDistribution = memo(function VideoDistribution({plot_name}) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
   
    const layout={
    xaxis: {title: 'x'},
    yaxis: {title: 'y'},
    autosize: true,
    margin: { t: 0, b: 0, l: 0, r: 0}
    }
    const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: "Video Clusters based on Topic Distribution",
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        const url = API_ROUTES.ANALYSIS + "/fetch_video_distribution"
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
        const styles = getComputedStyle(document.documentElement)
        const pointsColor = styles.getPropertyValue('--points-color')
        let text = data.map(item => item.title) || []
        text = text.map(title => title.split("/").pop().split("_transcript")[0]) // remove _transcript suffix

        let returnData = {
            x: data.map(item => item.x) || [],
            y: data.map(item => item.y) || [],
            text: text || [],
            customdata: data.map(item => item.topics) || [],
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: pointsColor,
                size: 6,
            },
            hovertemplate: "X: %{x}<br>Y: %{y}<br>Name: %{text}<br>Topics: %{customdata}"
        }
        return [returnData]
    }, [data])

    return (
    <>
    { 
        error ?
        <p className="m-2 text-md">Error loading Video Distribution plot: {error.toString()}</p>
        :
        <PlotTemplate layout={layout} config={config} data={processedData} name={plot_name} />
    }
    </>
)})

export default VideoDistribution