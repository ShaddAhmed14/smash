'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const LoadingPage = ({pillar, video_name}) => {
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const text = {
    "analysis": ["Running Analysis Modules...", "Loading Analysis Dashboard..."],
    "analytics": ["Generating Analytics...", "Loading Analytics Dashboard..."],
    "preview": ["Processing Video...", "Loading Preview Dashboard..."]
  }
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === 100) {
          clearInterval(interval)
          if(pillar === "preview") {
            router.push(`/${pillar}/${video_name}`)
          }
          else {router.push(`/${pillar}/`)}
          return 100
        }
        return prev + 10
      })
    }, 50)

    return () => {
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className="flex flex-col justify-center align-center items-center h-screen">
        {/* <div className="text-xl">{progress < 80 ? text[pillar][0] : text[pillar][1]}</div> */}
        <div className="w-3/4 bg-gray-200 rounded-full h-4 m-4">
          <div className="bg-blue-500 h-4 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}/>
        </div>
    </div>
  )
}

export default LoadingPage