'use client'

import { useState, useEffect, useRef, useMemo } from "react"
import { API_ROUTES } from '../../lib/api'

const Transcript = ({videoName, currentTime}) => {
  const transcriptRef = useRef(null);
  const [data, setData] = useState("");
  const [currentSegmentId, setCurrentSegmentId] = useState(null);
  const [error, setError] = useState(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const timeToSeconds = (timeStr) => {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (ms ? ms / 1000 : 0);
  }
  
  useEffect(() => {
      const url = API_ROUTES.PREVIEW + "/fetch_transcript/" + "?video_name=" + videoName
      fetch(url)
      .then(response => {
        if (!response.ok) {
          let message = response.json().message || response.statusText
          throw new Error(message)
        }
        return response.text()
      })
      .then(fetchedData => setData(fetchedData))
      .catch(err => {
        console.error("Fetch error:", err);
        setError(err.message || err.toString());
      })
  }, [])

  const processedTranscript = useMemo(() => {
    if (!data) return [];
    const segments = data.trim().split('\n\n');
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
  }, [data]);

  // Highlight current transcript segment based on currentTime
  useEffect(() => {
    if (!processedTranscript || processedTranscript.length === 0) {
        return
    }

    const handleTranscriptTimeUpdate = () => {
      let activeSegment
      if(currentTime >= processedTranscript[processedTranscript.length - 1].end){
        activeSegment = processedTranscript[processedTranscript.length - 1]
      }
      else {
        activeSegment = processedTranscript?.find(
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

  }, [currentSegmentId, processedTranscript, currentTime])

   

  return (
        <div className="flex flex-col">
          {/* Panel */}
          <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-primary)] flex flex-row items-center justify-between px-4 py-3">
            <p className="carbon-label-01 font-semibold uppercase tracking-[0.02em] text-[color:var(--text-secondary)]">Transcript</p>
          </div>
          {/* Transcript Content */}
          {
            error ? <p className="m-2 text-md">Error loading transcript: {error.toString()}</p> :
            <div 
              ref={transcriptRef}
              className="flex flex-col overflow-y-auto overflow-x-hidden m-1"
            >
              {processedTranscript.map((segment) => (
                // Transcript Segments
                <div
                  key={segment.id}
                  data-segment-id={segment.id}
                  className={`flex flex-row items-center gap-4 py-2 h-12 px-3 cursor-pointer transition-all duration-150 hover:bg-[color:var(--bg-secondary)] ${
                    currentSegmentId === segment.id && 'bg-[color:var(--bg-secondary)] border-l-2 border-[color:var(--custom-preview-dark)]'}`}>
                    <span className="text-[color:var(--text-tertiary)] carbon-label-01 font-mono px-2 py-1">{formatTime(segment.start)}</span>
                    <p className="carbon-body-01 text-nowrap">{segment.text}</p>
                </div>
              ))}
            </div> 
          }
        </div>
      )}

export default Transcript