'use client'
import { useState, useEffect, memo, useMemo } from "react"
import VideoCard from "../components/preview/VideoCard"
import NavBar from "../components/NavBar"
import Loader from "@/components/Loader"

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
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_metadata"
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
    // return data item if filter is default or value matches.
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
      return <div className="m-6 ">Error loading video metadata: {error.toString()}</div>;
    }
  if(videoMetadata == null){
    return  <Loader name={"Video Library"} />
  }

  return (
    <>
      <NavBar currentPage="Preview" textColor={"--custom-preview-dark"}/>
      <div className="mt-12">
        <div className="flex flex-col p-6 border-b border-primary">
          <p className="text-[1.5rem] font-normal mb-2">Preview Module</p>
          <div className="w-12 h-0.5 bg-(--custom-preview-dark) mb-3"></div>
          <p className="text-[0.875rem] text-secondary">Select videos for multimodal analysis. Choose up to 10 videos to process.</p>
        </div>
        {/* Filter Bar */}
        <div className="bg-secondary flex flex-row items-center justify-between px-6 py-4 border-b border-primary gap-4 flex-wrap">
          <div className="flex flex-row items-center gap-4">
            <p className="text-secondary text-[0.75rem] uppercase tracking-[0.02em] font-semibold">Filters:</p>
              <select name="languages" onChange={(e) => setFilters({...filters, language: e.target.value})} defaultValue={filters.language} className="filter-select">
                <option>All Languages</option>
                {
                  videoMetadata.languages.map((lang, idx) => (
                    <option key={idx} value={lang}>{lang}</option>
                  ))
                }
                </select>
            <select name="years" onChange={(e) => setFilters({...filters, year: e.target.value})} defaultValue={filters.year} className="filter-select">
              <option>All Years</option>
              {
                videoMetadata.years.map((year, idx) => (
                  <option key={idx} value={year}>{year}</option>
                ))
              }
            </select>
            <select name="genders" onChange={(e) => setFilters({...filters, gender: e.target.value})} defaultValue={filters.gender} className="filter-select">
              <option>All Genders</option>
              {
                videoMetadata.genders.map((gender, idx) => (
                  <option key={idx} value={gender}>{gender}</option>
                ))
              }
            </select>
            <select name="topics" onChange={(e) => setFilters({...filters, topic: e.target.value})} defaultValue={filters.topic} className="filter-select">
              <option>All Topics</option>
              {
                videoMetadata.topics.map((topic, idx) => (
                  <option key={idx} value={topic}>{topic}</option>
                ))
              }
            </select>
          </div>
          <div className="flex flex-row items-center justify-center gap-x-2">
            <p><b>{videoMetadata.num_videos}</b> videos</p>
            <p><b>{videoMetadata.total_duration}</b> minutes total</p>
            <p><b>{videoMetadata.num_speakers}</b> speakers</p>

          </div>
        </div>
        {/* Video Cards */}
        <div className="grid grid-cols-3 gap-5 p-6">
          {
            filteredData && filteredData.map((video_info, idx) => {

              return <VideoCard key={idx} video_info={video_info} handleClick={handleClick} selectedVideos={selectedVideos} />
            }
            )
          }
        </div>
        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 h-16 bg-secondary border-t border-primary flex flex-row justify-between items-center px-6 z-50 w-full">
          <div className="text-[0.875rem] text-secondary flex flex-row items-center gap-3">
            <span><span className="font-semibold text-primary inline-block text-center transition-transform duration-150 min-w-5">{selectedVideos.length}</span> videos selected</span>
            <p className="text-[0.75rem] text-tertiary py-1 px-2 bg-primary border border-primary bump:">Max 10</p>
            <p className={`text-[0.75rem] text-tertiary bg-none border-none cursor-pointer underline hover:text-primary`}  onClick={() => handleClick(null, true)}>Select all</p>
            <p className={`text-[0.75rem] text-tertiary bg-none border-none cursor-pointer underline hover:text-primary ${selectedVideos.length === 0 ? 'invisible' : ''}`}  onClick={() => setSelectedVideos([])}>Clear all</p>
          </div>
          <div className="flex flex-row gap-3">
            <button className="h-12 px-6 border-none text-[0.875rem] cursor-pointer bg-primary border-primary border text-primary hover:border-secondary">⚙ Configure</button>
            <a href={selectedVideos.length > 0 ? `/preview/${selectedVideos[0]}` : '#'}><button className="h-12 px-6 border-none text-[0.875rem] cursor-pointer bg-[#0f62fe] border-primary border text-white hover:bg-[#0353e9] disabled:text-tertiary disabled:cursor-not-allowed disabled:bg-primary" disabled={selectedVideos.length === 0 || selectedVideos.length > 10}>▶ Process Videos</button></a>
          </div>
        </div>
      </div>
    </>
  )
})

export default VideoLibrary