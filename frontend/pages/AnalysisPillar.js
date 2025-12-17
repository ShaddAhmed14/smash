'use client'
import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import NavBar from '../components/NavBar'
import Loader from '../components/Loader'

// const world_cloud_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_world_cloud"
const AnalysisPillar = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlot, setSelectedPlot] = useState(null)
  let containerStyle = 'w-auto h-[87vh] border-primary border-2 rounded-lg m-4 overflow-hidden'
  const components = ["Dynamic Time Warping (DTW) Analysis", "Video Distribution based on Topic Clusters", "Topic Interdistance Map", "Average Audio Features", "Audio Spectogram Embeddings", "Data Map"]

  const loadComponent = (name) => {
    const componentsMapping = { // maps plot names to component import functions
        "Dynamic Time Warping (DTW) Analysis": () => import('@/components/analysis/DTW'),
        "Video Distribution based on Topic Clusters": () => import('@/components/analysis/VideoDistribution'),
        "Topic Interdistance Map": () => import('@/components/analysis/TopicInterdistance'),
        "Average Audio Features": () => import('@/components/analysis/AverageAudioFeatures'),
        "Audio Spectogram Embeddings": () => import('@/components/analysis/VoronoiGraph'),
        "Data Map": () => import('@/components/analysis/DataMap'),    
      }
    return  componentsMapping[name];
    }

  const Component = selectedPlot ? dynamic(loadComponent(selectedPlot), 
   { ssr: false, loading: () => <Loader name={selectedPlot}/> }) : null;

  useEffect(() => { // simulate 5 second (5000ms) loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [])

  if(isLoading){
    return <Loader name="Analysis Pillar"/>
  }

  return (
    <>
      <NavBar currentPage="Analysis" textColor={"--custom-analysis-dark"} />
      <div className="plot-option-pill-container">
        <p className="text-[0.875rem] text-secondary">Select Visualization:</p>
        {
          components.map((name, idx) => (
            <p className={`plot-option-pill ${selectedPlot === name ? 'bg-secondary font-semibold border-2 border-(--button-primary)' : ''}`} key={idx}
            onClick={() => setSelectedPlot(name)}>{name}</p>
          ))
        }
      </div>
      <div className="m-4 bg-secondary">
        {Component &&
            <div key={selectedPlot} className="pillar-container">
              <p className="font-semibold text-[0.9375rem] border-b-2 border-(--custom-analysis-dark) py-3 px-4">{selectedPlot}</p>
              <Component plot_name={selectedPlot} />
            </div>
        }
      </div>
    </>
        )
}

export default AnalysisPillar