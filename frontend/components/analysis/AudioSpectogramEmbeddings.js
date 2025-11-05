'use client'
import { useState, useEffect, memo } from 'react'
import AudioSpectogramEmbeddingsGraph from './AudioSpectogramEmbeddingsGraph'

const AudioSpectogramEmbeddings = memo(function AudioSpectogramEmbeddings() {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_spectogram/?spectogram_name="
  const [data, setData] = useState(null)
  const [spectograms, setspectograms] = useState([null, null])

    const layout={
    title: {text: 'Audio Spectogram Embeddings'},
    scene: { // needed for 3d plot
        xaxis: {title: {text:'PCA 1'}},
        yaxis: {title: {text:'PCA 2'}},
        zaxis: {title: {text:'PCA 3'}},
    },}
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
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_audio_spectogram_embeddings/"
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

  const handleClick = (e) => {
    const spectogram_name = e.points[0]?.text
    setspectograms(prev => {
      if (prev.includes(spectogram_name)) {
        return prev.filter(v => v !== spectogram_name) // remove spectogram
      }
      else if (prev.length >= 2) {
        return [prev[1], spectogram_name] // replace the first spectogram if 2 are already selected
      }
      else return [...prev, spectogram_name] // add the new spectogram
  })}


  return (
    <div className="flex flex-row h-full w-full justify-between">
        {data ? 
        <div className="w-2/3">
          <AudioSpectogramEmbeddingsGraph data={data} selectedSpectograms={spectograms} config={config} layout={layout} handleClick={handleClick} />
        </div>
            : <div>Loading Audio Spectogram Graph...</div>
          }
        <div className="flex flex-col items-center  gap-y-4 align-middle justify-center w-1/3">
            {spectograms[0] ? <img title={spectograms[0]} src={url+spectograms[0]} controls /> : <p>Select upto 2 Spectograms to Preview</p>}
            {spectograms[1] ? <img title={spectograms[1]} src={url+spectograms[1]} controls /> : <p></p>}
        </div>
    </div>
  )
})

export default AudioSpectogramEmbeddings