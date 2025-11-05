'use client'
import dynamic from 'next/dynamic'

const DTW = dynamic(() => import('../components/analysis/DTW'), { ssr: false })
const VideoDistribution = dynamic(() => import('../components/analysis/VideoDistribution'), { ssr: false, loading: () => <p>Loading Video Distribution...</p> })
const TopicInterdistance = dynamic(() => import('../components/analysis/TopicInterdistance'), { ssr: false, loading: () => <p>Loading Topic Interdistance...</p> })
const AverageAudioFeatures = dynamic(() => import('../components/analysis/AverageAudioFeatures'), { ssr: false, loading: () => <p>Loading Average Audio Features...</p> })
const MaxAudioFeatures = dynamic(() => import('../components/analysis/MaxAudioFeatures'), { ssr: false, loading: () => <p>Loading Max Audio Features...</p> })
const VoronoiGraph = dynamic(() => import('../components/analysis/VoronoiGraph'), { ssr: false, loading: () => <p>Loading Voronoi Graph...</p> })
const DataMap = dynamic(() => import('../components/analysis/DataMap'), { ssr: false, loading: () => <p>Loading Data Map...</p> })

const AnalysisPillar = () => {
  let containerStyle = 'm-4 w-auto h-[90vh] border-green-500 border-2 rounded-lg p-4'
  const world_cloud_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYSIS + "/fetch_world_cloud"
  return (
    <div className="flex flex-col h-full w-full">
      
      <div className={containerStyle}>
        <DTW />
      </div>
      <div className={containerStyle}>
        <VideoDistribution />
      </div>
      <div className={containerStyle}>
        <TopicInterdistance />
      </div>
      <div className={`${containerStyle} flex flex-row justify-around`}>
        <AverageAudioFeatures />
        <MaxAudioFeatures />
      </div>
      <div className={containerStyle}>
        <VoronoiGraph />
      </div>
      <div className={containerStyle}>
        <img src={world_cloud_url} alt="World Cloud" className="w-full h-full object-within" />
      </div> 
      
      <div className={containerStyle}>
        <DataMap />
      </div>

      </div>
        )
}

export default AnalysisPillar