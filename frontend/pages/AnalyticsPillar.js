import TemporalSentimentGraph from '../components/analytics/TemporalSentimentGraph'
import RadialGraph from '../components/analytics/RadialGraph'

const AnalyticsPillar = () => {
  let containerStyle = 'm-4 w-auto h-[90vh] border-blue-500 border-2 rounded-lg p-4'

  return (
    <div className="flex flex-col h-full w-full">
      <div className={containerStyle}>
        <TemporalSentimentGraph />
      </div>
      <div className={containerStyle}>
        <RadialGraph />
      </div>
    </div>
  )
}

export default AnalyticsPillar