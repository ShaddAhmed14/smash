import DTW from '../components/DTW'
import VideoDistribution from '../components/VideoDistribution'
import TopicInterdistance from '../components/TopicInterdistance'
import AverageAudioFeatures from '../components/AverageAudioFeatures'
import MaxAudioFeatures from '../components/MaxAudioFeatures'
import AudioSpectogramEmbeddings from '../components/AudioSpectogramEmbeddings'

const AnalysisPillar = () => {
  let containerStyle = 'm-4 w-auto h-[90vh] border-green-500 border-2 rounded-lg p-4'
  const world_cloud_url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_world_cloud"
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
        <AudioSpectogramEmbeddings />
      </div>
      <div className={containerStyle}>
        <img src={world_cloud_url} alt="World Cloud" className="w-full h-full object-within" />
      </div>
      

    </div>
  )
}

export default AnalysisPillar