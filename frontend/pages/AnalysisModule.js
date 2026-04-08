'use client'
import {useEffect, useState, memo} from 'react'
import dynamic from 'next/dynamic'
import NavBar from '../components/NavBar'
import Loader from '../components/Loader'

const AnalysisModule = memo(function AnalysisModule() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlot, setSelectedPlot] = useState(null)
  const components = ["Dynamic Time Warping (DTW) Analysis", "Video Distribution based on Topic Clusters", "Topic Interdistance Map", "Average Audio Features", "Audio Spectogram Embeddings", "Data Map"]

  const loadComponent = (name) => {
    const componentsMapping = {
        "Dynamic Time Warping (DTW) Analysis": () => import('@/components/analysis/DTW'),
        "Video Distribution based on Topic Clusters": () => import('@/components/analysis/VideoDistribution'),
        "Topic Interdistance Map": () => import('@/components/analysis/TopicInterdistance'),
        "Average Audio Features": () => import('@/components/analysis/AverageAudioFeatures'),
        "Audio Spectogram Embeddings": () => import('@/components/analysis/VoronoiGraph'),
        "Data Map": () => import('@/components/analysis/DataMap'),
      }
    return componentsMapping[name];
    }

  const Component = selectedPlot ? dynamic(loadComponent(selectedPlot),
   { ssr: false, loading: () => <Loader name={selectedPlot}/> }) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [])

  if(isLoading){
    return <Loader name="Analysis Module"/>
  }

  return (
    <>
      <NavBar currentPage="Analysis" textColor={"--custom-analysis-dark"} />
      <div className="plot-option-pill-container">
        <p className="carbon-body-01 text-[color:var(--text-secondary)]">Select Visualization:</p>
        {
          components.map((name, idx) => (
            <p className={`plot-option-pill hover:bg-[color:var(--bg-secondary)] ${selectedPlot === name ? 'bg-[color:var(--bg-secondary)] font-semibold border-2 border-[color:var(--button-primary)]' : 'border border-[color:var(--border-primary)]'}`} key={idx}
            onClick={() => setSelectedPlot(name)}>{name}</p>
          ))
        }
      </div>
      {Component &&
          <div key={selectedPlot} className="module-container">
            <p className="carbon-heading-02 border-b-2 border-[color:var(--custom-analysis-dark)] py-3 px-4">{selectedPlot}</p>
            <Component plot_name={selectedPlot} />
          </div>
      }
    </>
  )
})

export default AnalysisModule
