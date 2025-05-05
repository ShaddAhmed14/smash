const VideoPlayer = ({video_name}) => {
    const api = process.env.NEXT_PUBLIC_BACKEND_URL + "video/" + video_name
    console.log("got", video_name)
  return (
    <div>
        <video src={api} controls></video>
    </div>
  )
}

export default VideoPlayer