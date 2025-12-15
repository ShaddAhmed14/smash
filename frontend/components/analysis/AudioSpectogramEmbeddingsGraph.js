'use client'
import {useEffect, memo, useMemo} from 'react'
import PlotTemplate from '../PlotTemplate'

const AudioSpectogramEmbeddingsGraph = memo(function AudioSpectogramEmbeddingsGraph({data, selectedSpectograms=[], config, layout, handleClick}) {
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

    useEffect(() => {
    if(isInitialized.current && plotlyRef?.current && containerRef?.current) {
      const newColors = data.text.map((video_name, index) => { return selectedSpectograms.includes(video_name) ? "red" : "blue" })
      const newSizes = data.text.map((video_name, index) => { return selectedSpectograms.includes(video_name) ? 12 : 6 })
      plotlyRef.current.restyle(containerRef.current, {
        'marker.color': [newColors],
        'marker.size': [newSizes]
      }, 0)
    }
  }, [selectedSpectograms, data])

    return (
        <div>
            <PlotTemplate layout={layout} config={config} data={processedData} name="Audio Spectogram Embeddings" handleClick={handleClick} />
        </div>
    )
})

export default AudioSpectogramEmbeddingsGraph