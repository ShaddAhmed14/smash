import { FaVideo, FaBrain, FaChartPie, FaCube, FaUsers, FaCode, FaInfoCircle} from 'react-icons/fa'
import { FaShield } from 'react-icons/fa6'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import Footer from '@/components/Footer'

const LandingPage = () => {
    const system_logo = "w-[100px] h-[100px] rounded-[20px] text-[40px] mx-auto mt-0 mb-[2rem] flex items-center justify-center text-white bg-gradient-to-r from-[#1f2937] to-[#374151] shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
    // const accent_line = "w-full mb-6 bg-gradient-accent-line h-[2px]"
    const big_button = "bg-secondary border-foreground border-[4px] flex flex-col items-center justify-start text-center p-8 cursor-pointer transition-all duration-[0.4s] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] rounded-lg hover:scale-[1.05]"
    const big_button_title = "text-2xl font-[700] mb-[1rem] text-text-primary transition-all duration-[0.3s] ease-linear"
    const big_button_subtitle = "text-lg font-[500] text-text-secondary transition-all duration-[0.3s] ease-linear"
    const big_button_icon = "w-[120px] h-[120px] mb-[2rem] flex text-white text-[48px] rounded-[20px] items-center justify-center transition-all duration-[0.3s] ease-linear"
  return (
    <>
        <NavBar currentPage="Landing" />
        <div className='m-15 flex flex-col items-center mx-auto py-10 min-h-screen justify-center'>
            {/* Header */}
            <div className='mx-auto flex flex-col items-center mb-16 items-center align-middle'>
                <div className={system_logo}>
                    <FaCube />
                </div>
                <p className='text-5xl md:text-6xl font-light mb-6'>SMASH</p>
                <div className="accent_line"></div>
                <p className="text-xl md:text-2xl text-center text-text-primary mb-4">Synthesis and Multimodal Analytics System</p>
                <p className="text-lg text-text-secondary max-w-2xl text-center mx-auto">
                    Choose your analytical pathway
                </p>
            </div>
            {/* Pillars */}
            <div className="grid lg:grid-cols-3 lg:grid-rows-1 justify-evenly gap-16 m-4 mt-10 grid-rows-3 grid-cols-1 w-3/4">
                <div className={big_button}>
                    <Link href={'/video_library/'} className={`${big_button_icon} align-middle bg-gradient-red`} >
                        <FaVideo />
                    </Link>
                    <p className={big_button_title}>Source <br /> Material</p>
                    <div className="accent_line"></div>
                    <p className={big_button_subtitle}>Input & Preprocessing</p>
                </div>
                <div className={big_button}>
                    <Link href={'/loading/analysis'} className={`${big_button_icon} align-middle bg-gradient-green`}>
                        <FaBrain />
                    </Link>
                    <p className={big_button_title}>Analysis <br />Modules</p>
                    <div className="accent_line"></div>
                    <p className={big_button_subtitle}>Core Processing Engine</p>
                </div>
                <div className={big_button}>
                    <Link href={'/loading/analytics'} className={`${big_button_icon} bg-gradient-blue`}>
                        <FaChartPie />
                    </Link>
                    <p className={big_button_title}>Summary <br />Analytics</p>
                    <div className="accent_line"></div>
                    <p className={big_button_subtitle}>Insights & Reporting</p>
                </div>
            </div>
            {/* About SMASH */}
            <div className="bg-secondary border-2 border-primary rounded-lg p-12 m-10">
                    <h3 className="text-3xl font-semibold mb-6 flex items-center">
                        <FaInfoCircle className="mr-4" />
                        About SMASH
                    </h3>
                    <div className="accent_line"></div>

                    <div className="text-secondary leading-relaxed space-y-4 text-lg">
                        <p>
                            SMASH is a fully open-source tool that helps us better understand the composition of non-verbal communication aspects, like body language, facial expressions, and the melodic aspects of speech. It combines data masking for privacy protection with analysis modules that inform about how speakers communicated beyond the words uttered.
                        </p>
                        
                        <p>
                            By integrating body language, facial expressions, voice, and content in an easily understandable way, SMASH allows a detailed zoomed-out view of the full gamut of communication modes. The tool offers standard baselines based on already analyzed speaker databases and options for data export for customized analysis.
                        </p>
                    </div>
                    <div className="mt-12 pt-8 border-t-2 border-secondary">
                        <h4 className="text-xl font-semibold mb-4">Project Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-secondary mb-1">Duration</p>
                                <p className="font-semibold">7 December 2024 until 7 December 2025</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary mb-1">Organization</p>
                                <p className="font-semibold">Radboud University, Hasso Plattner Institute</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary mb-1">Project Members</p>
                                <p className="font-semibold">Wim Pouw, Babajide Owoyele, Sharjeel Shaikh, Gerard de Melo</p>
                            </div>
                            <div>
                                <p className="text-sm text-secondary mb-1">Funding</p>
                                <p className="font-semibold">NWO (Netherlands Organisation for Scientific Research)</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <div className="text-center p-6 flex flex-col items-center info-card rounded-lg">
                            <FaShield className="mb-4 text-4xl" />
                            <h4 className="font-semibold mb-2">Privacy-First</h4>
                            <p className="text-sm text-secondary">Built-in masking tools to protect participant privacy</p>
                        </div>
                        <div className="text-center p-6 flex flex-col items-center info-card rounded-lg">
                            <FaCode className="mb-4 text-4xl" />
                            <h4 className="font-semibold mb-2">Open Source</h4>
                            <p className="text-sm text-secondary">Fully transparent and accessible to all researchers</p>
                        </div>
                        <div className="text-center p-6 flex flex-col items-center info-card rounded-lg">
                            <FaUsers className="mb-4 text-4xl" />
                            <h4 className="font-semibold mb-2">User-Friendly</h4>
                            <p className="text-sm text-secondary">No programming experience required</p>
                        </div>
                    </div>
            </div>
        </div>
        <Footer />
    </>
  )
}

export default LandingPage