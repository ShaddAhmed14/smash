'use client'
import { useEffect, useRef } from 'react'

import WaveSurfer from 'wavesurfer.js'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

const AudioWaveform = ({video_name, video_ref}) => {
  const waveform_ref = useRef(null);
  const wavesurfer_ref = useRef(null);
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_audio" + "?video_name=" + video_name;
  
  useEffect(() => {
    wavesurfer_ref.current = WaveSurfer.create({
      container: waveform_ref.current,
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
    
    wavesurfer_ref.current.load(url);
   
    return () => {
      if (wavesurfer_ref.current) {
        wavesurfer_ref.current.destroy();
      }
    };
  }, [url]);

  useEffect(() => {
    if (!video_ref?.current || !wavesurfer_ref.current) return;

    const video = video_ref.current;
    const wavesurfer = wavesurfer_ref.current;
    wavesurfer.setVolume(0)

    const syncWaveformToVideo = () => {
      const progress = video.currentTime / video.duration;
      wavesurfer.seekTo(progress);
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
    };
  }, [video_ref]);

  return (
    <div className="w-full">
      <div 
        ref={waveform_ref} 
        className="w-full border rounded-lg bg-gray-50"
      />
    </div>
  )
}

export default AudioWaveform