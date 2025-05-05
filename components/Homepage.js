import React from 'react'
import Introduction from "@/components/Introduction"
import Options from "@/components/Options"
import VideoList from "@/components/VideoList"

const Homepage = () => {
  return (
    <div className='flex flex-col gap-2 items-center justify-between m-5'>
        <Introduction />
        <Options />
        <VideoList/>
    </div>
  )
}

export default Homepage