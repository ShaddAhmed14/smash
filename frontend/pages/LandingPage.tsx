'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import NavBar from '@/components/NavBar';

interface ModuleInfo {
  step: string;
  title: string;
  color: string;
  description: string;
  url: string;
}

const modules: Record<string, ModuleInfo> = {
  preview: {
    step: 'Step 1 of 3',
    title: 'Preview Module',
    color: '#E05A7A',
    description: 'Upload and preview your audiovisual recordings. Prepare source material for multimodal analysis with automatic transcription and waveform visualization.',
    url: '/video_library'
  },
  analysis: {
    step: 'Step 2 of 3',
    title: 'Analysis Module',
    color: '#3ddbd9',
    description: 'Extract and analyze multimodal features including gesture trajectories, facial expressions, and speech prosody using state-of-the-art computer vision and audio processing.',
    url: '/analysis'
  },
  analytics: {
    step: 'Step 3 of 3',
    title: 'Analytics Module',
    color: '#FFC166',
    description: 'Visualize patterns across your corpus with semantic networks, feature correlations, and temporal analyses. Export findings for publication.',
    url: '/analytics'
  }
};

const LandingPage = () => {
  const [activeModule, setActiveModule] = useState<string>('preview');
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  useEffect(() => {
    // Show panel with animation on mount
    const timer = setTimeout(() => setIsPanelVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);

    // Update face icons and numbers
    ['preview', 'analysis', 'analytics'].forEach(id => {
      const numEl = document.getElementById(`num-${id}`);
      const iconEl = document.getElementById(`icon-${id}`);
      const outlineEl = document.getElementById(`outline-${id}`);

      if (numEl && iconEl && outlineEl) {
        const isActive = id === moduleId;
        numEl.setAttribute('opacity', isActive ? '0' : '1');
        iconEl.setAttribute('opacity', isActive ? '1' : '0');
        outlineEl.setAttribute('opacity', isActive ? '1' : '0');
      }
    });
  };

  const module = modules[activeModule];

  return (
    <>
      <NavBar currentPage="Landing" />

      <main className="flex flex-col items-center min-h-screen justify-center px-6 md:px-12 py-12 pt-24">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-[2.5rem] font-extralight tracking-[-0.02em] mb-2">SMASH</h1>
          <p className="text-[0.875rem] text-secondary">
            Synthesis and Multimodal Analytics System for Humanities
          </p>
        </div>

        {/* Main Content: Cube + Info Panel */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16 w-full max-w-7xl">
          {/* Interactive 3D Cube */}
          <div className="relative w-full max-w-[750px] h-[400px] lg:h-[600px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 110"
              style={{ maxHeight: '600px' }}
            >
              {/* Selection outlines */}
              <path
                className="face-outline"
                id="outline-preview"
                d="M50 20 L20 38 L20 72 L50 90 Z"
                fill="none"
                stroke="#0f62fe"
                strokeWidth="0.5"
                opacity="1"
              />
              <path
                className="face-outline"
                id="outline-analytics"
                d="M50 20 L80 38 L80 72 L50 90 Z"
                fill="none"
                stroke="#0f62fe"
                strokeWidth="0.5"
                opacity="0"
              />
              <path
                className="face-outline"
                id="outline-analysis"
                d="M50 20 L80 38 L50 55 L20 38 Z"
                fill="none"
                stroke="#0f62fe"
                strokeWidth="0.5"
                opacity="0"
              />

              {/* Left face - Preview Module (Pink) */}
              <path
                className="cursor-pointer transition-[filter] duration-200 stroke-transparent stroke-0 hover:brightness-[1.08] active:brightness-[1.12]"
                id="face-preview"
                d="M50 20 L20 38 L20 72 L50 90 Z"
                fill="#E05A7A"
                onClick={() => handleModuleClick('preview')}
              />
              <text
                className="font-semibold text-[12px] pointer-events-none fill-[rgba(255,255,255,0.9)]"
                id="num-preview"
                x="33"
                y="62"
                textAnchor="middle"
                dominantBaseline="central"
                opacity="0"
              >
                1
              </text>
              <g id="icon-preview" opacity="1">
                <path
                  d="M25 62 Q29 52, 33 62 Q37 72, 41 62"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Right face - Analytics Module (Amber) */}
              <path
                className="cursor-pointer transition-[filter] duration-200 stroke-transparent stroke-0 hover:brightness-[1.08] active:brightness-[1.12]"
                id="face-analytics"
                d="M50 20 L80 38 L80 72 L50 90 Z"
                fill="#FFC166"
                onClick={() => handleModuleClick('analytics')}
              />
              <text
                className="font-semibold text-[12px] pointer-events-none fill-[rgba(255,255,255,0.9)]"
                id="num-analytics"
                x="67"
                y="62"
                textAnchor="middle"
                dominantBaseline="central"
              >
                3
              </text>
              <g id="icon-analytics" opacity="0">
                <circle
                  cx="67"
                  cy="62"
                  r="7"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="67"
                  cy="62"
                  r="2.5"
                  fill="rgba(255,255,255,0.7)"
                />
              </g>

              {/* Top face - Analysis Module (Teal) */}
              <path
                className="cursor-pointer transition-[filter] duration-200 stroke-transparent stroke-0 hover:brightness-[1.08] active:brightness-[1.12]"
                id="face-analysis"
                d="M50 20 L80 38 L50 55 L20 38 Z"
                fill="#3ddbd9"
                onClick={() => handleModuleClick('analysis')}
              />
              <text
                className="font-semibold text-[12px] pointer-events-none fill-[rgba(255,255,255,0.9)]"
                id="num-analysis"
                x="50"
                y="38"
                textAnchor="middle"
                dominantBaseline="central"
              >
                2
              </text>
              <g id="icon-analysis" opacity="0">
                <path
                  d="M38 38 Q50 28, 62 38"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="62"
                  cy="38"
                  r="2.5"
                  fill="rgba(255,255,255,0.7)"
                />
              </g>
            </svg>
          </div>

          {/* Info Panel */}
          <div
            className={`w-full lg:w-[340px] min-h-[300px] bg-secondary border border-primary p-8 transition-all duration-300 ${
              isPanelVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
            }`}
          >
            <p
              className="text-[0.75rem] font-semibold tracking-[0.05em] mb-2 uppercase"
              style={{ color: module.color }}
            >
              {module.step}
            </p>
            <h2 className="text-[1.5rem] font-normal mb-3">
              {module.title}
            </h2>
            <div
              className="w-10 h-0.5 mb-4"
              style={{ background: module.color }}
            />
            <p className="text-[0.875rem] leading-[1.6] text-secondary mb-6">
              {module.description}
            </p>
            <Link href={module.url}>
              <Button
                kind="primary"
                renderIcon={ArrowRight}
                style={{
                  background: module.color,
                  borderColor: module.color
                }}
                className="hover:opacity-90"
              >
                Begin
              </Button>
            </Link>
          </div>
        </div>

        {/* Hint */}
        <p className="mt-12 text-center text-[0.75rem] text-tertiary">
          Click a face of the cube to explore each module
        </p>

        {/* Footer */}
        <footer className="mt-12 text-center text-[0.75rem] text-tertiary">
          <p>Radboud University · Donders Institute for Brain, Cognition and Behaviour</p>
        </footer>
      </main>
    </>
  );
};

export default LandingPage;
