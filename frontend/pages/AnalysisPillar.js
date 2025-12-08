'use client'
import dynamic from 'next/dynamic'
import {Suspense} from 'react'
import NavBar from '../components/NavBar'
import Loader from '../components/Loader'

const DTW = dynamic(() => import('../components/analysis/DTW'), { ssr: false })
const VideoDistribution = dynamic(() => import('../components/analysis/VideoDistribution'), { ssr: false, loading: () => <Loader name="Video Distribution" /> })
const TopicInterdistance = dynamic(() => import('../components/analysis/TopicInterdistance'), { ssr: false, loading: () => <Loader name="Topic Interdistance" /> })
const AverageAudioFeatures = dynamic(() => import('../components/analysis/AverageAudioFeatures'), { ssr: false, loading: () => <Loader name="Average Audio Features" /> })
const MaxAudioFeatures = dynamic(() => import('../components/analysis/MaxAudioFeatures'), { ssr: false, loading: () => <Loader name="Max Audio Features" /> })
const VoronoiGraph = dynamic(() => import('../components/analysis/VoronoiGraph'), { ssr: false, loading: () => <Loader name="Voronoi Graph" /> })
const DataMap = dynamic(() => import('../components/analysis/DataMap'), { ssr: false, loading: () => <Loader name="Data Map" /> })

const AnalysisPillar = () => {
  let containerStyle = 'm-4 w-auto h-[85vh] border-primary border-2 rounded-lg p-2'
  const world_cloud_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_world_cloud"
  let components = {
    "Dynamic Time Warping (DTW) Analysis": DTW,
    "Video Distribution based on Topic Clusters": VideoDistribution,
    "Topic Interdistance Map": TopicInterdistance,
    "Average Audio Features": AverageAudioFeatures,
    "Audio Spectogram Embeddings": VoronoiGraph,
    "Data Map": DataMap
  }
  return (
    <>
      <NavBar currentPage="Analysis" textColor={"--custom-analysis-dark"} />
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

export default AnalysisPillar