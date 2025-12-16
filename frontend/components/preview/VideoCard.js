import {memo} from 'react'
import Link from 'next/link'

const VideoCard = memo(function VideoCard({video_info, handleClick}) {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_thumbnail/?video_name=" + video_info.video_id
  return (
    <div className="flex flex-col bg-secondary border-primary border">
      <div className="relative">
        <img className="w-full h-[180px] object-cover" src={url} alt={`Thumbnail for ${video_info.video_name}`} loading="lazy" />
        <p className="absolute bottom-2 right-2 bg-black opacity-80 text-white text-[0.75rem] px-2 py-1">{video_info.duration} min</p>
        <input type="checkbox" className="absolute top-3 right-3 w-6 h-6" onChange={() => handleClick(video_info.video_id)} />
      </div>
      <div className='m-2 p-2'>
        <h1 className="text-[0.9375rem]/1.4 font-semibold wrap-break-words mb-1.5" >{video_info.video_name}</h1>
        <p className="text-[0.8125rem] text-secondary mb-3">{video_info.speaker_name}</p>
        <div className="flex flex-row justify-between my-2 text-sm">
          <p className="text-[0.75rem] text-tertiary mb-3">{video_info.year}</p>
          <p className="text-[0.75rem] text-tertiary mb-3">ID: {video_info.video_id}</p>
        </div>
        <div className="flex flex-row gap-1.5 flex-wrap">
          {
            video_info.topics.map((topic, idx) => (
              <p key={idx} className="bg-primary text-secondary text-[0.6875rem] border-primary px-2 py-1">{topic}</p>
            ))
          }
        </div>
      </div>
    </div>
  )
})

export default VideoCard