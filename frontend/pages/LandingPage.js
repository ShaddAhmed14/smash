import { FaVideo, FaBrain, FaChartPie, FaCube} from 'react-icons/fa'
import Link from 'next/link'

const LandingPage = () => {
    const system_logo = "w-[100px] h-[100px] rounded-[20px] text-[40px] mx-auto mt-0 mb-[2rem] flex items-center justify-center text-white bg-gradient-to-r from-[#1f2937] to-[#374151] shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
    const accent_line = " w-1/2 mx-auto mb-6 bg-gradient-to-r from-black rounded-[2px] h-[4px]"
    const big_button = "bg-white border-black border-[4px] flex flex-col items-center justify-start text-center p-8 cursor-pointer transition-all duration-[0.4s] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
    const big_button_title = "text-2xl font-[700] mb-[1rem] text-black transition-all duration-[0.3s] ease-linear"
    const big_button_subtitle = "text-lg font-[500] text-[#666] transition-all duration-[0.3s] ease-linear"
    const big_button_icon = "w-[120px] h-[120px] mb-[2rem] flex text-white text-[48px] rounded-[20px] items-center justify-center transition-all duration-[0.3s] ease-linear"
    
  return (
    <div className='flex flex-col items-center mx-auto py-10 min-h-screen justify-center font-[Inter] bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] '>
        <div className={system_logo}>
            <FaCube />
        </div>
        <p className='text-5xl md:text-6xl font-light mb-6'>SMASH</p>
        <div className={accent_line}></div>
        <p className="text-xl md:text-2xl text-center text-gray-700 mb-4">Synthesis and Multimodal Analytics System</p>
        <p className="text-lg text-gray-600 max-w-2xl text-center mx-auto">
            Choose your analytical pathway
        </p>
        <div className="grid lg:grid-cols-3 lg:grid-rows-1 justify-evenly gap-16 m-4 mt-10 grid-rows-3 grid-cols-1 w-3/4">
            <div className={big_button}>
                <Link href="/preview/ted_kid" className={`${big_button_icon} align-middle bg-linear-[135deg] from-[#dc2626] to-[#ef4444] shadow-[0_8px_20px_rgba(220,38,38,0.3)]`} >
                    <FaVideo />
                </Link>
                <p className={big_button_title}>Source <br /> Material</p>
                <p className={big_button_subtitle}>Input & Preprocessing</p>
            </div>
            <div className={big_button}>
                <Link href="/analysis/ted_kid" className={`${big_button_icon} align-middle bg-linear-[135deg] from-[#059669] to-[#10b981] shadow-[0_8px_20px_rgba(5,150,105,0.3)]`}>
                    <FaBrain />
                </Link>
                <p className={big_button_title}>Analysis <br />Modules</p>
                <p className={big_button_subtitle}>Core Processing Engine</p>
            </div>
            <div className={big_button}>
                <Link href="/analytics/ted_kid" className={`${big_button_icon} bg-[#2563eb] bg-linear-[135deg] from-[#2563eb] to-[#3b82f6] shadow-[0_8px_20px_rgba(37,99,235,0.3)]`}>
                    <FaChartPie />
                </Link>
                <p className={big_button_title}>Summary <br />Analytics</p>
                <p className={big_button_subtitle}>Insights & Reporting</p>
            </div>
        </div>
    </div>
  )
}

export default LandingPage