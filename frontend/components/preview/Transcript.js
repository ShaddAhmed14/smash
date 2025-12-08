'use client'

import { useState, useEffect, useRef } from "react"

const Transcript = ({videoName, videoRef}) => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_transcript/" + "?video_name=" + videoName;
  const transcriptRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [currentSegmentId, setCurrentSegmentId] = useState(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      const response = await fetch(url);
      const data = await response.text();
      const parsed = parseSRT(data);
      setTranscript(parsed);
    };

    fetchTranscript();
  }, [url]);

  useEffect(() => {
    const video = videoRef ? videoRef.current : null;
    if (!video) {
        return;
    }
    if (!transcript || transcript.length === 0) {
        return;
    }

    const handleTranscriptTimeUpdate = () => {
      const currentTime = video.currentTime;
      const activeSegment = transcript?.find(
        segment => currentTime >= segment.start && currentTime < segment.end
      );
      
      if (activeSegment && activeSegment.id !== currentSegmentId) {
        setCurrentSegmentId(activeSegment.id);
        
        // Auto-scroll to current segment
        const transcriptContainer = transcriptRef.current;
        const activeElement = transcriptContainer?.querySelector(`[data-segment-id="${activeSegment.id}"]`);
        
        if (activeElement && transcriptContainer) {
          // since we have variable height segments, and a flex container, we need to calculate the scroll position manually
          let scrollPosition = 0
          const allSegments = Array.from(transcriptContainer.children)
          const activeIndex = allSegments.indexOf(activeElement)
          for (let i = 0; i < activeIndex; i++) {
            scrollPosition += allSegments[i].clientHeight
          }

          scrollPosition -= (transcriptContainer.clientHeight / 2) + (activeElement.clientHeight / 2)
          transcriptContainer.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: 'smooth'
          })
        }
      }
    }

    video.addEventListener('timeupdate', handleTranscriptTimeUpdate);
    video.addEventListener('play', handleTranscriptTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTranscriptTimeUpdate)
      video.removeEventListener('play', handleTranscriptTimeUpdate)
    };
  }, [videoRef, currentSegmentId, transcript]);

   const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseSRT = (srtContent) => {
  const segments = srtContent.trim().split('\n\n');
  return segments.map(segment => {
    const lines = segment.split('\n');
    const timeRange = lines[1];
    const [startTime, endTime] = timeRange.split(' --> ');
    
    return {
      id: parseInt(lines[0]),
      start: timeToSeconds(startTime),
      end: timeToSeconds(endTime),
      text: lines.slice(2).join(' ')
    };
  });
};


const timeToSeconds = (timeStr) => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + (ms ? ms / 1000 : 0);
};



  return (
        transcript ? <div 
          ref={transcriptRef}
          className="flex flex-col overflow-y-auto overflow-x-hidden rounded-lg"
        >
          {transcript.map((segment) => (
            <div
              key={segment.id}
              data-segment-id={segment.id}
              className={`p-3 cursor-pointer transition-all duration-300 ${
                currentSegmentId === segment.id
                  ? 'bg-primary border-l-4 border-secondary shadow-md transform scale-102'
                  : 'bg-tertiary hover:bg-secondary border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-start space-x-2 rounded-lg">
                <span className={`text-xs font-mono px-2 py-1 ${
                  currentSegmentId === segment.id
                    ? ' text-primary'
                    : 'text-secondary'
                }`}>
                  {formatTime(segment.start)}
                </span>
                <p className={`text-sm leading-relaxed flex-1 ${
                  currentSegmentId === segment.id
                    ? 'text-primary font-medium'
                    : 'text-secondary'
                }`}>
                  {segment.text}
                </p>
              </div>
            </div>
          ))}
        </div> : <div>Loading transcript...</div>
      )}

export default Transcript