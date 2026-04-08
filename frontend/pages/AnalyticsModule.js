'use client'
import {useState, useEffect, memo} from 'react'
import dynamic from 'next/dynamic'
import NavBar from '../components/NavBar'
import Loader from '../components/Loader'

const AnalyticsModule = memo(function AnalyticsModule() {
  const components = ["Temporal Sentiment Graph", "Radial Graph", "Kinematic Features", "Spacy Analysis", "Semantic Network"]

  const [selectedPlot, setSelectedPlot] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadComponent = (name) => {
    const componentsMapping = {
      "Temporal Sentiment Graph": () => import('@/components/analytics/TemporalSentimentGraph'),
      "Radial Graph": () => import('@/components/analytics/RadialGraph'),
      "Kinematic Features": () => import('@/components/analytics/KinematicFeatures'),
      "Spacy Analysis": () => import('@/components/analytics/SpaceyTranscript'),
      "Semantic Network": () => import('@/components/analytics/SemanticNetwork'),
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
    return <Loader name="Analytics Module"/>
  }

  return (
    <>
      <NavBar currentPage="Analytics" textColor={"--custom-analytics-dark"} />
      <div className="plot-option-pill-container">
        <p className="carbon-body-01 text-[color:var(--text-secondary)]">Select a plot to display:</p>
        {
          components.map((name, idx) => (
            <p className={`plot-option-pill hover:bg-[color:var(--bg-secondary)] ${selectedPlot === name ? 'bg-[color:var(--bg-secondary)] font-semibold border-2 border-[color:var(--button-primary)]' : 'border border-[color:var(--border-primary)]'}`} key={idx}
            onClick={() => setSelectedPlot(name)}>{name}</p>
          ))
        }
      </div>
      {Component &&
        <div key={selectedPlot} className="module-container relative">
          <p className="carbon-heading-02 border-b-2 border-[color:var(--custom-analytics-dark)] py-3 px-4">{selectedPlot}</p>
          <Component plot_name={selectedPlot} />
        </div>
      }
    </>
  )
})

export default AnalyticsModule
