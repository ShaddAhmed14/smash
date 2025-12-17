'use client'

import { useState, useEffect, useRef } from "react"

const Transcript = ({videoName, currentTime}) => {
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
  }, [url])

  useEffect(() => {
    if (!transcript || transcript.length === 0) {
        return
    }

    const handleTranscriptTimeUpdate = () => {
      let activeSegment
      if(currentTime >= transcript[transcript.length - 1].end){
        activeSegment = transcript[transcript.length - 1]
      }
      else {
        activeSegment = transcript?.find(
          segment => currentTime >= segment.start && currentTime < segment.end
        )
      }

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
    handleTranscriptTimeUpdate()

  }, [currentSegmentId, transcript, currentTime])

   const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

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
  }

  const timeToSeconds = (timeStr) => {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (ms ? ms / 1000 : 0);
  }

  return (
        transcript && 
        <div className="flex flex-col">
          {/* Panel */}
          <div className="bg-secondary border border-primary flex flex-row items-center justify-between px-4 py-3">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.02em] text-secondary">Transcript</p>
          </div>
          {/* Transcript Content */}
          <div 
            ref={transcriptRef}
            className="flex flex-col overflow-y-auto overflow-x-hidden m-1"
          >
            {transcript.map((segment) => (
              // Transcript Segments
              <div
                key={segment.id}
                data-segment-id={segment.id}
                className={`flex flex-row items-center gap-4 py-2 h-12 px-3 cursor-pointer transition-all duration-150 hover:bg-secondary ${
                  currentSegmentId === segment.id && 'bg-secondary border-l-2 border-(--custom-preview-dark)'}`}>
                  <span className="text-tertiary text-[0.75rem] font-mono px-2 py-1">{formatTime(segment.start)}</span>
                  <p className="text-[0.875rem]/1.5 text-nowrap">{segment.text}</p>
              </div>
            ))}
          </div> 
        </div>
      )}

export default Transcript