import KinematicFeatures from './Gesture/KinematicFeatures'

const GestureAnalysis = ({video_name}) => {
  return (
    <div>
      <KinematicFeatures video_name={video_name} />
    </div>
  )
}

export default GestureAnalysis