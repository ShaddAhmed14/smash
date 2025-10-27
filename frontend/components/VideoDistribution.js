'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from './PlotTemplate'

const VideoDistribution = memo(function VideoDistribution() {
    const [data, setData] = useState(null)
   
    const layout={
    title: {text: 'Video Clusters based on Topic Distribution'},
    xaxis: {title: 'x'},
    yaxis: {title: 'y'},
    autosize: true,
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
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_video_distribution"
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        let returnData = {
            x: data.map(item => item.x) || [],
            y: data.map(item => item.y) || [],
            text: data.map(item => item.title) || [],
            customdata: data.map(item => item.topics) || [],
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: 'blue',
                size: 6,
            },
            hovertemplate: "X: %{x}<br>Y: %{y}<br>Video: %{text}<br>Topics: %{customdata}"
        }
        return [returnData]
    }, [data])

    return (
      <div>
        <PlotTemplate layout={layout} config={config} data={processedData} />
      </div>
    )

})

export default VideoDistribution