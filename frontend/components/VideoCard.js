import {memo, useContext} from 'react'
// import { VideoContext } from '@/app/page'
import Link from 'next/link'

const VideoCard = memo(function({video_info}) {
  // console.log("videocard", video_info)
  // const {setVideoName, setChangeVideo} = useContext(VideoContext)
  return (
    <div className="my-2 p-3 flex flex-row max-w-full border">
      <div className="flex flex-col justify-between ml-2 max-w-full">
          <h1 className="wrap-break-word" >Name: {video_info.video_name}</h1>
          <p>Duration: {video_info.duration}</p>
          <p>Topics: {video_info.topics.join("| ")}</p>
          <Link className="bg-blue-700 w-3/4 mx-auto text-white mt-2 p-2 rounded" href={`loading/preview/${video_info.video_name}`}>
            Process Video
          </Link>
          
      </div>
    </div>
  )
})

export default VideoCard
// onClick={() => {
//             setVideoName(video_info.video_name)
//             setChangeVideo(false)
//             }}