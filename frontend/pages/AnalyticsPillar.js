'use client'
import dynamic from 'next/dynamic'
import {Suspense} from 'react'
import NavBar from '../components/NavBar'

const TemporalSentimentGraph = dynamic(() => import('../components/analytics/TemporalSentimentGraph'), { ssr: false, loading: () => <p>Loading Temporal Sentiment Graph...</p> })
const RadialGraph = dynamic(() => import('../components/analytics/RadialGraph'), { ssr: false, loading: () => <p>Loading Radial Graph...</p> })
const KinematicFeatures = dynamic(() => import('../components/analytics/KinematicFeatures'), { ssr: false, loading: () => <p>Loading Kinematic Features...</p> })

const AnalyticsPillar = () => {
  let containerStyle = 'm-4 w-auto h-[90vh] border-blue-500 border-2 rounded-lg p-4'

  return (
    <>
      <NavBar currentPage="Analytics" />    
      <div className="flex flex-col mt-16 h-full w-full">
        <Suspense fallback={<div>Loading Temporal Sentiment Graph...</div>}>
          <div className={containerStyle}>
            <TemporalSentimentGraph />
          </div>
        </Suspense>
        <Suspense fallback={<div>Loading Radial Graph...</div>}>
          <div className={containerStyle}>
            <RadialGraph />
          </div>
        </Suspense>
        <Suspense fallback={<div>Loading Kinematic Features...</div>}>
        <div className={containerStyle}>
          <KinematicFeatures />
        </div>
        </Suspense>
      </div>
    </>
  )
}

export default AnalyticsPillar