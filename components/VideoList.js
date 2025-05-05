"use client"
import { useState, useEffect } from "react"
import VideoPlayer from "@/components/VideoPlayer"

const VideoList = () => {
    const [data, setData] = useState(null)
    const [inspect, setInspect] = useState(null)
    
    useEffect(() => {
            const api = process.env.NEXT_PUBLIC_BACKEND_URL
            fetch(api)
            .then((res) => res.json())
            .then((data) => {console.log(data) 
            setData(data)})
    }, [])

    if(!data) return <div>Loading Videos</div>

  return (
    <div className="bg-gray-500 p-5 rounded-4xl">
        <div className="items-center mb-2">
            <h1 className="text-black text-3xl text-center">Our Videos at a Glance!</h1>
        </div>
        <div className="flex flex-row justify-between ">
            <div className="">
                {data.map((item) => (
                    <div key={item.title} className="flex flex-row justify-between items-start w-full"> 
                        <h4 className="mb-2 border-2 p-1" onClick={() => setInspect(item.title)}>{item.title}</h4>
                        {/* <p>{item.length}</p> */}
                    </div>
                )
            )}
            </div>
            <div className="w-3/4">
                {inspect ? <VideoPlayer video_name={inspect} /> : ""}
            </div>
        </div>
    </div>
  )
}

export default VideoList

// read video names from 