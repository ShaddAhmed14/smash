'use client'

import { useState, useEffect, useRef } from "react"

const AudioTranscript = ({video_name, video_ref}) => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_transcript" + "?video_name=" + video_name;
  const transcriptRef = useRef(null);
  const [transcript, setTranscript] = useState("");
  const [currentSegmentId, setCurrentSegmentId] = useState(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      const response = await fetch(url);
      const data = await response.text();
      const parsed = parseSRT(data);
      console.log("Parsed Transcript:", parsed);
      setTranscript(parsed);
    };

    fetchTranscript();
  }, [url]);

  useEffect(() => {
    console.log("came in use effect")
    const video = video_ref ? video_ref.current : null;
    if (!video) {
        console.log("No video reference available");
        return;
    }
    if (!transcript || transcript.length === 0) {
        console.log("Transcript not loaded yet");
        return;
    }

    const handleTranscriptTimeUpdate = () => {
        console.log("called update time")
      const currentTime = video.currentTime;
      console.log(transcript ? transcript : "No transcript available");
      const activeSegment = transcript?.find(
        segment => currentTime >= segment.start && currentTime < segment.end
      );
      console.log("Current Time:", currentTime, "Active Segment:", activeSegment);
      
      if (activeSegment && activeSegment.id !== currentSegmentId) {
        console.log("Active Segment ID:", activeSegment.id);
        setCurrentSegmentId(activeSegment.id);
        
        // Auto-scroll to current segment
        const transcriptContainer = transcriptRef.current;
        const activeElement = transcriptContainer?.querySelector(`[data-segment-id="${activeSegment.id}"]`);
        
        if (activeElement && transcriptContainer) {
          const containerHeight = transcriptContainer.clientHeight;
          const elementTop = activeElement.offsetTop;
          const elementHeight = activeElement.clientHeight;
          
          // Calculate scroll position to center the active element
          const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
          
          transcriptContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    };

    video.addEventListener('timeupdate', handleTranscriptTimeUpdate);
    video.addEventListener('play', handleTranscriptTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTranscriptTimeUpdate)
      video.removeEventListener('play', handleTranscriptTimeUpdate)
    };
  }, [video_ref, currentSegmentId, transcript]);

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
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
            <p>current segment id: {currentSegmentId}</p>
          {transcript.map((segment) => (
            <div
              key={segment.id}
              data-segment-id={segment.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                currentSegmentId === segment.id
                  ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-102'
                  : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  currentSegmentId === segment.id
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {formatTime(segment.start)}
                </span>
                <p className={`text-sm leading-relaxed flex-1 ${
                  currentSegmentId === segment.id
                    ? 'text-blue-900 font-medium'
                    : 'text-gray-700'
                }`}>
                  {segment.text}
                </p>
              </div>
            </div>
          ))}
        </div> : <div>Loading transcript...</div>
      )}

export default AudioTranscript