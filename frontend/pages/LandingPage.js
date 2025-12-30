import { FaVideo, FaBrain, FaChartPie, FaCube, FaUsers, FaCode, FaInfoCircle} from 'react-icons/fa'
import { FaShield } from 'react-icons/fa6'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import Footer from '@/components/Footer'

const LandingPage = () => {
  return (
    <>
        <NavBar currentPage="Landing" textColor={'--custom-preview-dark'} />
        <div className='flex flex-col items-center min-h-screen justify-center px-12 py-6 pt-24'>
            {/* Header */}
            <div className='text-center mb-12'>
                <p className='text-[2.5rem] font-extralight tracking-[-0.02em] mb-2'>SMASH</p>
                <p className="text-[0.875rem] text-secondary">Synthesis and Multimodal Analytics System for Humanities</p>
            </div>
            {/* modules */}
            <div className="flex flex-row justify-center items-center gap-16">
                <div className="relative w-[750px] h-[800px]">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 110">
                        <path className="face-outline" id="outline-preview" d="M50 20 L20 38 L20 72 L50 90 Z" fill="none" stroke="#0f62fe" strokeWidth="0.5" opacity="0"/>
                        <path className="face-outline" id="outline-analytics" d="M50 20 L80 38 L80 72 L50 90 Z" fill="none" stroke="#0f62fe" strokeWidth="0.5" opacity="0"/>
                        <path className="face-outline" id="outline-analysis" d="M50 20 L80 38 L50 55 L20 38 Z" fill="none" stroke="#0f62fe" strokeWidth="0.5" opacity="0"/>
                        
                        <Link href="/video_library">
                            <path className="cursor-pointer transition-[filter] duration-200 stroke-transparent stroke-0 hover:brightness-110" d="M50 20 L20 38 L20 72 L50 90 Z" fill="#E05A7A"/>
                                <text className="font-semibold text-[12px] pointer-events-none fill-[rgba(255,255,255,0.9)]" id="num-preview" x="33" y="62" textAnchor="middle" dominantBaseline="central">1</text>
                            <g id="icon-preview" opacity="0">
                                <path d="M25 62 Q29 52, 33 62 Q37 72, 41 62" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                            </g>
                        </Link>
                        
                        <Link href="/analytics">
                            <path className="cursor-pointer transition-[filter] duration-200 stroke-transparent stroke-0 hover:brightness-110" d="M50 20 L80 38 L80 72 L50 90 Z" fill="#FFC166" />
                                <text className="font-semibold text-[12px] pointer-events-none fill-[rgba(255,255,255,0.9)]" id="num-analytics" x="67" y="62" textAnchor="middle" dominantBaseline="central">3</text>
                            <g id="icon-analytics" opacity="0">
                                <circle cx="67" cy="62" r="7" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5"/>
                                <circle cx="67" cy="62" r="2.5" fill="rgba(255,255,255,0.7)"/>
                            </g>
                        </Link>
                        
                        <Link href="/analysis">
                            <path className="cursor-pointer transition-[filter] duration-200 stroke-transparent stroke-0 hover:brightness-110" d="M50 20 L80 38 L50 55 L20 38 Z" fill="#3ddbd9" />
                                <text className="font-semibold text-[12px] pointer-events-none fill-[rgba(255,255,255,0.9)]" id="num-analysis" x="50" y="38" textAnchor="middle" dominantBaseline="central">2</text>
                            <g id="icon-analysis" opacity="0">
                                <path d="M38 38 Q50 28, 62 38" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                <circle cx="62" cy="38" r="2.5" fill="rgba(255,255,255,0.7)"/>
                            </g>
                        </Link>
                    </svg>
                </div>
                <div className="w-[340px] min-h-[300px] bg-secondary border border-primary p-8 transition-[opacity,transform] duration-300 " id="infoPanel">
                    <div className="text-[0.75rem] font-semibold tracking-[0.05em] mb-2 uppercase" id="infoStep">Step 1 of 3</div>
                    <h2 className="text-[1.5rem] font-normal mb-3" id="infoTitle">Preview Module</h2>
                    <div className="w-10 h-0.5 mb-4 bg-[#E05A7A]" id="infoDivider"></div>
                    <p className="text-[0.875rem]/[1.6] text-secondary mb-6 " id="infoDesc">
                        Upload and preview your audiovisual recordings. Prepare source material for multimodal analysis with automatic transcription and waveform visualization.
                    </p>
                    <Link href="/video_library">
                        <button className="py-3 px-6 text-[0.875rem] font-medium no-underline border-none cursor-pointer transition-opacity duration-200 inline-block text-white hover:opacity-90 bg-[#E05A7A]" id="infoBtn">
                            Begin →
                        </button>
                    </Link>
                </div>
            </div>
            <p className="mt-12 text-center text-[0.75rem] text-tertiary">Click a face of the cube to explore each module</p>
            <div className="mt-12 text-center text-[0.75rem] text-tertiary">
                <p>Radboud University · Donders Institute for Brain, Cognition and Behaviour</p>
            </div>

        </div>
    </>
  )
}

export default LandingPage