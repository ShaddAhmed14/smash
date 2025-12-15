'use client'
import {useState, useEffect} from 'react'
import dynamic from 'next/dynamic'
import NavBar from '../components/NavBar'
import Loader from '../components/Loader'

const AnalyticsPillar = () => {
  let components = ["Temporal Sentiment Graph", "Radial Graph", "Kinematic Features"]
  
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadComponent = (name) => {
  const componentsMapping = { // maps plot names to component import functions
      "Temporal Sentiment Graph": () => import('@/components/analytics/TemporalSentimentGraph'),
      "Radial Graph": () => import('@/components/analytics/RadialGraph'),
      "Kinematic Features": () => import('@/components/analytics/KinematicFeatures')   
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
    return <Loader name="Analytics Pillar"/>
  }

  return (
    <>
      <NavBar currentPage="Analytics" textColor={"--custom-analytics"} />
      <p className="text-h3">Select a plot to display:</p>
      <div className="plot-option-pill-container">
        {
          components.map((name, idx) => (
            <p className={`plot-option-pill ${selectedPlot === name ? 'bg-gradient-analytics text-white' : ''}`} key={idx}
            onClick={() => setSelectedPlot(name)}>{name}</p>
          ))
        }
      </div>
      <div>
        {Component &&
          <div key={selectedPlot} className="pillar-container">
            <Component plot_name={selectedPlot} />
          </div>
        }
      </div>
    </>
  )
}

export default AnalyticsPillar