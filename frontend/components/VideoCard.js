const VideoCard = ({ video_info }) => {
  console.log("videocard", video_info)
  return (
    <div>
        <h1>{video_info.video_name}</h1>
        <p>{video_info.duration}</p>
        <p>{video_info.topics.join("| ")}</p>
    </div>
  )
}

export default VideoCard