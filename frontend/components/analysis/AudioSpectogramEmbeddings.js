'use client'
import { useState, useEffect, memo } from 'react'
import AudioSpectogramEmbeddingsGraph from './AudioSpectogramEmbeddingsGraph'

const AudioSpectogramEmbeddings = memo(function AudioSpectogramEmbeddings() {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_spectogram/?spectogram_name="
  let audio_spectogram_embeddings_url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_audio_spectogram_embeddings"

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
        fetch(audio_spectogram_embeddings_url)
            .then(response => response.json())
            .then(fetchedData => {
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
    <div className="flex flex-row justify-center items-center gap-2 w-full h-full">
        {data &&
        <div className="w-[70%] h-full border border-primary object-contain rounded-lg overflow-hidden">
          <AudioSpectogramEmbeddingsGraph data={data} selectedSpectograms={spectograms} config={config} layout={layout} handleClick={handleClick} />
        </div>
          }
        <div className="flex flex-col items-center gap-y-2 justify-evenly w-[25%]">
            {spectograms[0] ? 
            <div className="w-full rounded-lg border border-primary">
              <img className="object-contain rounded-lg max-w-full h-auto" src={url+spectograms[0]} /> 
              <p className="break-words text-xs p-2">{spectograms[0]}</p>
            </div> : <p>Select upto 2 Spectograms to Preview</p>
            }
            {spectograms[1] ? 
            <div className="w-full rounded-lg border border-primary">
              <img className="object-contain rounded-lg max-w-full h-auto" src={url+spectograms[1]} /> 
              <p className="break-words text-xs p-2">{spectograms[1]}</p>
            </div> : null
            }
        </div>
    </div>
  )
})

export default AudioSpectogramEmbeddings