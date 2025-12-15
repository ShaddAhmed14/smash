import {memo} from 'react'
import Link from 'next/link'
import { IoMdSettings } from "react-icons/io";
import { MdAccessTimeFilled } from "react-icons/md";

const VideoCard = memo(function VideoCard({video_info}) {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_thumbnail/?video_name=" + video_info.video_id
  console.log(video_info)
  return (
    <div className="flex flex-col border bg-secondary rounded-lg">
      <img className="w-full h-auto rounded-t-lg object-cover" src={url} alt={`Thumbnail for ${video_info.video_name}`} loading="lazy" />
      <div className='m-2 p-2'>
        <h1 className=" text-lg break-words" >{video_info.video_name}</h1>
        <div className="flex flex-row justify-between my-2 text-sm">
          <p className="flex items-center gap-2"><MdAccessTimeFilled /> {video_info.duration} min</p>
          <p>ID: {video_info.video_id}</p>
        </div>
        <div className="flex flex-row gap-2">
          {
            video_info.topics.map((topic, idx) => (
              <p key={idx} className="bg-primary text-primary p-2 px-3 rounded-full text-sm">{topic}</p>
            ))
          }
        </div>
      </div>
      <Link className="bg-primary text-primary w-3/4 mx-auto m-2 p-2 rounded-lg border cursor-pointer" href={`/preview/${video_info.video_id}`}>
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