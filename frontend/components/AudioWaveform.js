'use client'
import { useEffect, useRef, memo} from 'react'

import WaveSurfer from 'wavesurfer.js'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

const AudioWaveform = memo(function AudioWaveform({videoName, videoRef}) {
  console.log("in audio", videoName, videoRef)
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4F46E5',
      progressColor: '#06B6D4',
      cursorColor: '#EF4444',
      barWidth: 2,
      responsive: true,
      height: 200,
      plugins: [
        Timeline.create({
      height: 20,
      insertPosition: 'afterend', //  'beforebegin'
      timeInterval: 0.2, 
      primaryLabelInterval: 5, 
      secondaryLabelInterval: 1,
      style: {
        fontSize: '10px',
        color: '#2D5016',
      },
    })
      ]
    });
    
  }, []);

  useEffect(() => {
    const audio_peaks_url = process.env.NEXT_PUBLIC_BACKEND_URL + "/audio_peaks?video_name=" + videoName
    const audio_url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_audio?video_name=" + videoName
    
    fetch(audio_peaks_url) 
      .then(response => response.json())
      .then(data => {
        wavesurferRef.current.load(audio_url, data)
      })
      .catch(error => {
        console.error("Error fetching audio peaks:", error)
      })

  }, [videoName]);

  useEffect(() => {
    if (!videoRef?.current || !wavesurferRef.current) return;

    const video = videoRef.current;
    const wavesurfer = wavesurferRef.current;
    wavesurfer.setVolume(0)

    const syncWaveformToVideo = () => {
      const currentTime = video?.currentTime;
      const duration = video?.duration;
      
      if (duration && isFinite(currentTime) && isFinite(duration)) {
        const progress = currentTime / duration;
        wavesurfer.seekTo(progress);
      }
    };

    const handleWaveformPlay = () => wavesurfer.play();
    const handleWaveformPause = () => wavesurfer.pause();

    video.addEventListener('timeupdate', syncWaveformToVideo);
    video.addEventListener('play', handleWaveformPlay);
    video.addEventListener('pause', handleWaveformPause);

    const handleWaveformSeek = (progress) => {
      video.currentTime = progress * video.duration;
    };
    
    wavesurfer.on('seek', handleWaveformSeek);

    return () => {
      video.removeEventListener('timeupdate', syncWaveformToVideo);
      video.removeEventListener('play', handleWaveformPlay);
      video.removeEventListener('pause', handleWaveformPause);
      wavesurfer.un('seek', handleWaveformSeek);
      wavesurfer.destroy()
    };
  }, [videoRef]);

  return (
    <div className="w-full">
      {wavesurferRef ? 
      <div 
        ref={waveformRef} 
        className="w-full"
      /> :
      <p>Loading Waveform</p>
      }
    </div>
  )
})

export default AudioWaveform