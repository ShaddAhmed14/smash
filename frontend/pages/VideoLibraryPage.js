'use client'
import { useState, useEffect, memo, useMemo } from "react"
import VideoCard from "../components/preview/VideoCard"
import NavBar from "../components/NavBar"
import Loader from "@/components/Loader"
import { API_ROUTES } from '../lib/api'

const VideoLibrary = memo(function VideoLibrary() {
  const [videoMetadata, setVideoMetadata] = useState(null)
  const [selectedVideos, setSelectedVideos] = useState([])
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    year: "All Years",
    topic: "All Topics",
    language: "All Languages",
    gender: "All Genders"
  })

  useEffect(() => {
    let url = API_ROUTES.PREVIEW + "/fetch_metadata"
    fetch(url)
      .then(response => {
        return response.json().then(data => {
          if (!response.ok) {
            throw new Error(data.message || response.statusText);
          }
          return data;
        });
      })
      .then(data => {
        setVideoMetadata({...data})
      })
      .catch(error => {
        console.error("Error fetching metadata:", error);
        setError(error.message || error.toString());
      });
  }, [])

  const filteredData = useMemo(() => {
    if (!videoMetadata) return [];
    return videoMetadata.data.filter(video => {
      const matchYear = filters.year === "All Years" || video.year.toString() === filters.year;
      const matchTopic = filters.topic === "All Topics" || video.topics.includes(filters.topic);
      const matchLanguage = filters.language === "All Languages" || video.language === filters.language;
      const matchGender = filters.gender === "All Genders" || video.speaker_gender === filters.gender;
      return matchYear && matchTopic && matchLanguage && matchGender;
    })
  }, [videoMetadata, filters])

  const handleClick = (video_id, selectAll = false) => {
    if (selectAll) {
      const allIds = filteredData.map(video => video.video_id);
      setSelectedVideos(allIds);
    }
    else {
      setSelectedVideos(prevSelected => {
        if (prevSelected.includes(video_id)) {
          return prevSelected.filter(id => id !== video_id);
        } else {
          return [...prevSelected, video_id];
        }
      });
    }
  }

  if (error) {
    return <div className="p-6 mt-12 carbon-body-01 text-[color:var(--text-secondary)]">Error loading video metadata: {error.toString()}</div>;
  }
  if(videoMetadata == null){
    return <Loader name={"Video Library"} />
  }

  return (
    <>
      <NavBar currentPage="Preview" textColor={"--custom-preview-dark"}/>
      <div className="pt-12">
        {/* Page header */}
        <div className="flex flex-col px-6 py-6 border-b border-[color:var(--border-primary)]">
          <h1 className="carbon-heading-04 mb-2">Preview Module</h1>
          <div className="w-12 h-0.5 bg-[color:var(--custom-preview-dark)] mb-3"></div>
          <p className="carbon-body-01 text-[color:var(--text-secondary)]">Select videos for multimodal analysis. Choose up to 10 videos to process.</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[color:var(--bg-secondary)] flex flex-row items-center justify-between px-6 py-3 border-b border-[color:var(--border-primary)] gap-4 flex-wrap">
          <div className="flex flex-row items-center gap-4 flex-wrap">
            <p className="carbon-label-01 font-semibold uppercase text-[color:var(--text-secondary)]">Filters:</p>
            <select name="languages" onChange={(e) => setFilters({...filters, language: e.target.value})} defaultValue={filters.language} className="filter-select" aria-label="Filter by language">
              <option>All Languages</option>
              {videoMetadata.languages.map((lang, idx) => (
                <option key={idx} value={lang}>{lang}</option>
              ))}
            </select>
            <select name="years" onChange={(e) => setFilters({...filters, year: e.target.value})} defaultValue={filters.year} className="filter-select" aria-label="Filter by year">
              <option>All Years</option>
              {videoMetadata.years.map((year, idx) => (
                <option key={idx} value={year}>{year}</option>
              ))}
            </select>
            <select name="genders" onChange={(e) => setFilters({...filters, gender: e.target.value})} defaultValue={filters.gender} className="filter-select" aria-label="Filter by gender">
              <option>All Genders</option>
              {videoMetadata.genders.map((gender, idx) => (
                <option key={idx} value={gender}>{gender}</option>
              ))}
            </select>
            <select name="topics" onChange={(e) => setFilters({...filters, topic: e.target.value})} defaultValue={filters.topic} className="filter-select" aria-label="Filter by topic">
              <option>All Topics</option>
              {videoMetadata.topics.map((topic, idx) => (
                <option key={idx} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-row items-center gap-4 carbon-label-01 text-[color:var(--text-secondary)]">
            <span><b>{videoMetadata.num_videos}</b> videos</span>
            <span><b>{videoMetadata.total_duration}</b> minutes</span>
            <span><b>{videoMetadata.num_speakers}</b> speakers</span>
          </div>
        </div>

        {/* Video Cards — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 pb-24">
          {filteredData && filteredData.map((video_info, idx) => (
            <VideoCard key={idx} video_info={video_info} handleClick={handleClick} selectedVideos={selectedVideos} />
          ))}
        </div>

        {/* Action Bar — consistent 64px height */}
        <div className="fixed bottom-0 left-0 h-16 bg-[color:var(--bg-secondary)] border-t border-[color:var(--border-primary)] flex flex-row justify-between items-center px-6 z-50 w-full" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.05)' }}>
          <div className="carbon-body-01 text-[color:var(--text-secondary)] flex flex-row items-center gap-4">
            <span><span className="font-semibold text-[color:var(--text-primary)] inline-block text-center min-w-5">{selectedVideos.length}</span> videos selected</span>
            <span className="carbon-label-01 text-[color:var(--text-tertiary)] py-1 px-2 bg-[color:var(--bg-primary)] border border-[color:var(--border-primary)]">Max 10</span>
            <button className="carbon-label-01 text-[color:var(--text-tertiary)] bg-transparent border-none cursor-pointer underline hover:text-[color:var(--text-primary)]" onClick={() => handleClick(null, true)}>Select all</button>
            <button className={`carbon-label-01 text-[color:var(--text-tertiary)] bg-transparent border-none cursor-pointer underline hover:text-[color:var(--text-primary)] ${selectedVideos.length === 0 ? 'invisible' : ''}`} onClick={() => setSelectedVideos([])}>Clear all</button>
          </div>
          <div className="flex flex-row gap-3">
            <button className="h-10 px-4 border border-[color:var(--border-primary)] bg-transparent carbon-body-01 cursor-pointer text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] cta-hover">Configure</button>
            <a href={selectedVideos.length > 0 ? `/preview/${selectedVideos[0]}` : '#'}>
              <button className="h-10 px-4 border border-[color:var(--button-primary)] bg-[color:var(--button-primary)] carbon-body-01 cursor-pointer text-white cta-hover disabled:opacity-40 disabled:cursor-not-allowed" disabled={selectedVideos.length === 0 || selectedVideos.length > 10}>Process Videos</button>
            </a>
          </div>
        </div>
      </div>
    </>
  )
})

export default VideoLibrary
