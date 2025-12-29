"use client"
// loader needs client directive since library uses contexts
import Loader from '@/components/Loader'

const Loading = () => {
  return (
    <Loader name={"Analytics Module"}/>
  )
}

export default Loading