'use client'
import dynamic from 'next/dynamic'
import {Suspense} from 'react'
import NavBar from '../components/NavBar'
import Loader from '../components/Loader'

const TemporalSentimentGraph = dynamic(() => import('../components/analytics/TemporalSentimentGraph'), { ssr: false, loading: () => <p>Loading Temporal Sentiment Graph...</p> })
const RadialGraph = dynamic(() => import('../components/analytics/RadialGraph'), { ssr: false, loading: () => <p>Loading Radial Graph...</p> })
const KinematicFeatures = dynamic(() => import('../components/analytics/KinematicFeatures'), { ssr: false, loading: () => <p>Loading Kinematic Features...</p> })

const AnalyticsPillar = () => {
  let containerStyle = 'm-4 w-auto h-[85vh] border-primary border-2 rounded-lg p-2'
  let components = {
    "Temporal Sentiment Graph": TemporalSentimentGraph,
    "Radial Graph": RadialGraph,
    "Kinematic Features": KinematicFeatures
  }

  return (
    <>
      <NavBar currentPage="Analytics" textColor={"--custom-analytics"} /> 
      <div className="flex flex-col mt-16 h-full w-full">
        {
          Object.entries(components).map(([name, Component]) => (
              <Suspense fallback={<Loader name={name} />}>
            <div key={name} className={containerStyle}>
              <div className="flex flex-col w-full">
                <p className="text-lg font-semibold text-primary">{name}</p>
                <div className="accent_line"></div>
                <Component plot_name={name} />
              </div>
            </div>
              </Suspense>
          ))
        }
      </div>   
    </>
  )
}

export default AnalyticsPillar