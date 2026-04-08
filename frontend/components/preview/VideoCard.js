import {memo} from 'react'
import { API_ROUTES } from '../../lib/api'

const VideoCard = memo(function VideoCard({video_info, handleClick, selectedVideos}) {
  const url = API_ROUTES.PREVIEW + "/fetch_thumbnail/?video_name=" + video_info.video_id
  const isSelected = selectedVideos.includes(video_info.video_id)

  return (
    <div className={`flex flex-col bg-[color:var(--bg-secondary)] border hover-lift cursor-pointer overflow-hidden ${isSelected ? 'border-[color:var(--button-primary)] border-2' : 'border-[color:var(--border-primary)]'}`}>
      {/* Thumbnail — 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden">
        <img className="w-full h-full object-cover" src={url || null} alt={`Thumbnail for ${video_info.video_name}`} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white carbon-label-01 px-2 py-0.5">{video_info.duration} min</span>
        <input
          type="checkbox"
          className="absolute top-3 right-3 w-5 h-5 cursor-pointer"
          onChange={() => handleClick(video_info.video_id)}
          checked={isSelected}
          aria-label={`Select ${video_info.video_name}`}
        />
      </div>
      {/* Card body — consistent padding */}
      <div className="p-4">
        <h3 className="carbon-heading-02 break-words mb-1">{video_info.video_name}</h3>
        <p className="carbon-body-01 text-[color:var(--text-secondary)] mb-3">{video_info.speaker_name}</p>
        <div className="flex flex-row justify-between mb-3">
          <span className="carbon-label-01 text-[color:var(--text-tertiary)]">{video_info.year}</span>
          <span className="carbon-label-01 text-[color:var(--text-tertiary)]">ID: {video_info.video_id}</span>
        </div>
        <div className="flex flex-row gap-2 flex-wrap">
          {video_info.topics.map((topic, idx) => (
            <span key={idx} className="carbon-label-01 bg-[color:var(--bg-primary)] text-[color:var(--text-secondary)] border border-[color:var(--border-primary)] px-2 py-0.5">{topic}</span>
          ))}
        </div>
      </div>
    </div>
  )
})

export default VideoCard
