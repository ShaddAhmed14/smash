"use client"
import { redirect } from 'next/navigation'

const Options = () => {
    const style = "border-2 border-white p-2 rounded-2xl"
  return (
    <div className='bg-gray-500 p-5 flex flex-row items-center justify-between w-3/4 rounded-4xl'>
        <div onClick={() => redirect("video")} className={style}>Video</div>
        <div onClick={() => redirect("audio")} className={style}>Audio</div>
        <div onClick={() => redirect("gesture")} className={style}>Gestures</div>
        <div onClick={() => redirect("gesture")} className={style}>MaskAnyone</div>

    </div>
  )
}

export default Options