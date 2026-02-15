'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import VideoPlayerPanel from '@/components/preview/VideoPlayerPanel';
import WaveformPanel from '@/components/preview/WaveformPanel';
import TranscriptPanel from '@/components/preview/TranscriptPanel';
import ProcessingBanner from '@/components/preview/ProcessingBanner';

interface PreviewProcessingPageProps {
  videoName: string;
}

interface TranscriptSegment {
  time: string;
  text: string;
  seconds: number;
}

const PreviewProcessingPage = ({ videoName }: PreviewProcessingPageProps) => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // Default 5 minutes
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingComplete, setProcessingComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch video metadata
        const metadataUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_PREVIEW}/fetch_metadata`;
        const metadataResponse = await fetch(metadataUrl);

        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          const videoInfo = metadata.find((v: any) => v.video_name === videoName);
          if (videoInfo) {
            setDuration(videoInfo.duration);
          }
        }

        // Fetch audio waveform peaks (we'll generate from audio later)
        // For now, generate mock waveform data
        const mockWaveform = Array.from({ length: 200 }, (_, i) =>
          Math.sin(i / 10) * 0.5 + Math.random() * 0.5
        );
        setWaveformData(mockWaveform);

        // Fetch transcript (parse SRT file)
        // For now, use mock transcript data
        const mockTranscript: TranscriptSegment[] = [
          { time: '00:00', text: 'Welcome to this presentation on multimodal communication analysis.', seconds: 0 },
          { time: '00:05', text: 'Today we will explore how gestures and speech work together.', seconds: 5 },
          { time: '00:12', text: 'First, let\'s examine the role of hand movements in discourse.', seconds: 12 },
          { time: '00:18', text: 'Research shows that gestures are tightly synchronized with speech prosody.', seconds: 18 },
          { time: '00:25', text: 'This synchronization occurs at multiple levels of linguistic structure.', seconds: 25 },
          { time: '00:32', text: 'From phonological patterns to semantic content alignment.', seconds: 32 },
          { time: '00:38', text: 'Let\'s look at some examples from natural conversations.', seconds: 38 },
          { time: '00:45', text: 'Notice how the speaker\'s hand rises during pitch accents.', seconds: 45 },
        ];
        setTranscript(mockTranscript);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching preview data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [videoName]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleProcessingComplete = () => {
    setProcessingComplete(true);
    // After processing completes, you might want to navigate somewhere
    // router.push('/analysis');
  };

  if (isLoading) {
    return (
      <>
        <NavBar currentPage="Preview" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#E05A7A] border-r-transparent mb-4"></div>
            <p className="text-[0.875rem] text-secondary">Loading preview data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar currentPage="Preview" />

      <main className="mt-12 h-[calc(100vh-48px-72px)] grid grid-cols-1 lg:grid-cols-2 grid-rows-[auto_1fr] lg:grid-rows-[1fr_auto] gap-0 border-t border-primary">
        {/* Video Player - Left Column */}
        <div className="border-r border-b lg:border-b border-primary overflow-hidden">
          <VideoPlayerPanel
            videoName={videoName}
            currentTime={currentTime}
            duration={duration}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Waveform - Right Column */}
        <div className="border-b border-primary overflow-hidden">
          <WaveformPanel
            videoName={videoName}
            currentTime={currentTime}
            duration={duration}
            waveformData={waveformData}
            onSeek={handleTimeUpdate}
          />
        </div>

        {/* Transcript - Full Width Bottom */}
        <div className="col-span-1 lg:col-span-2 border-primary overflow-hidden">
          <TranscriptPanel
            transcript={transcript}
            currentTime={currentTime}
            onSeek={handleTimeUpdate}
          />
        </div>
      </main>

      {/* Processing Banner - Fixed Bottom */}
      <ProcessingBanner
        onComplete={handleProcessingComplete}
        autoStart={true}
      />
    </>
  );
};

export default PreviewProcessingPage;
