'use client'
import {useEffect, useState, useMemo, memo} from 'react'
import PlotTemplate from '../PlotTemplate'

const TopicInterdistance = memo(function TopicInterdistance({plot_name}) {
    const [data, setData] = useState(null)

    const layout={
    xaxis: {title: 'x'},
    yaxis: {title: 'y'},
    autosize: true,
    margin: { t: 20, b: 20, l: 20, r: 20}
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
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_topic_interdistance"
        fetch(url)
            .then(response => response.json())
            .then(fetchedData => {
                setData(fetchedData)
            })
    }, [])

    const processedData = useMemo(() => {
        if (!data) return {}
        const styles = getComputedStyle(document.documentElement)
        const pointsColor = styles.getPropertyValue('--points-color')
        const counts = data.map(item => item.Count)
        const maxCount = Math.max(...counts)
        const minCount = Math.min(...counts)
        const minSize = 6
        const maxSize = 20
        const marker_sizes = counts.map(count => {
            return ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize) + minSize
        })
        let returnData = {
            x: data.map(item => item.x) || [],
            y: data.map(item => item.y) || [],
            text: data.map(item => item.Name) || [],
            customdata: data.map(item => [
                item.Topic, item["Top Words"], item["Associated Videos"]
            ]) || [],
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: pointsColor,
                size: marker_sizes,
            },
            hovertemplate: "X: %{x}<br>Y: %{y}<br>Topic Number | Name: %{customdata[0]} | text<br>Top Words: %{customdata[1]}<br>Top Associated Videos: %{customdata[2]}<extra></extra>"
        }
        return [returnData]
    }, [data])

    return (
    <PlotTemplate layout={layout} config={config} data={processedData} name={plot_name} />
    )

})

export default TopicInterdistance