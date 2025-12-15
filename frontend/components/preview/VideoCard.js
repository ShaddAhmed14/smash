import {memo, useContext} from 'react'
import Link from 'next/link'
import { IoMdSettings } from "react-icons/io";
import { MdAccessTimeFilled } from "react-icons/md";

const VideoCard = memo(function({video_info}) {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_thumbnail/?video_name=" + video_info.video_id
  
  return (
    <div className="flex flex-col border pb-3 bg-secondary">
      <img className="w-full h-auto object-cover" src={url} alt={`Thumbnail for ${video_info.video_name}`} loading="lazy" />
      <div className='m-2'>
        <h1 className="break-words" >{video_info.video_name}</h1>
        <p className="flex items-center gap-2"><MdAccessTimeFilled /> {video_info.duration} min</p>
        <div className="flex flex-row gap-2 flex-wrap m-2">
          {
            video_info.topics.map((topic, idx) => (
              <p key={idx} className="bg-primary text-primary p-2 rounded-full text-sm">{topic}</p>
            ))
          }
        </div>
      </div>
      <Link className="bg-primary text-primary w-3/4 mx-auto m-2 p-2 rounded-lg border cursor-pointer" href={`loading/preview/${video_info.video_id}`}>
        <p className="flex flex-row gap-2 items-center justify-center"> <IoMdSettings /> Process Video</p>
      </Link>
    </div>
  )
})

export default VideoCard
// onClick={() => {
//             setVideoName(video_info.video_name)
//             setChangeVideo(false)
//             }}