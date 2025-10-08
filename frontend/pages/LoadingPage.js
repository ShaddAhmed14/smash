'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const LoadingPage = ({pillar, video_name}) => {
  const [progress, setProgress] = useState(0)
  console.log("came here", pillar, video_name)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === 100) {
          clearInterval(interval)
          router.push(`/${pillar}/${video_name}`)
          return 100
        }
        return prev + 10
      })
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className="flex flex-col justify-center align-center items-center h-screen">
        <div className="text-xl font-bold">{progress < 80 ? "Processing Video..." : "Loading Dashboard..."}</div>
        <div className="w-3/4 bg-gray-200 rounded-full h-4 m-4">
          <div className="bg-blue-500 h-4 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}/>
        </div>
    </div>
  )
}

export default LoadingPage