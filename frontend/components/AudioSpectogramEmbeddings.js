'use client'
import {useEffect, useState, memo, useMemo} from 'react'
import PlotTemplate from './PlotTemplate'

const AudioSpectogramEmbeddings = memo(function AudioSpectogramEmbeddings() {
    const [data, setData] = useState(null)
    const layout={
    title: {text: 'Audio Spectogram Embeddings'},
    scene: { // needed for 3d plot
        xaxis: {title: {text:'PCA 1'}},
        yaxis: {title: {text:'PCA 2'}},
        zaxis: {title: {text:'PCA 3'}},
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
      filename: "Audio Spectogram Embeddings",
      height: 500,
      width: 700,
      scale: 1
    }
    }

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_audio_spectogram_embeddings"
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
        if (!data || data == null) return {}
        
        let labels = data.map(item => item.label)
        let colors = []
        const colorMap = {
            0: 'red',
            1: 'blue',
            2: 'green',
            3: 'orange',
            4: 'purple',
            5: 'brown',
            6: 'pink',
            7: 'gray',
            8: 'olive',
            9: 'cyan'
        }
        labels.forEach(label => {
            colors.push(colorMap[label])
        })

        let returnData = {
            x: data.map(item => item.x) || [],
            y: data.map(item => item.y) || [],
            z: data.map(item => item.z) || [],
            text: data.map(item => item.filename) || [],
            customdata: data.map(item => item.label) || [],
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                color: colors,
                size: 5,
            },
            hovertemplate: "Cluster: %{customdata}<br>Title: %{text}<br>PCA 1: %{x}<br>PCA 2: %{y}<br>PCA 3: %{z}<extra></extra>"
        }
        return [returnData]
    }, [data])

    return (
        <div>
            <PlotTemplate layout={layout} config={config} data={processedData} />
        </div>
    )
})

export default AudioSpectogramEmbeddings