import Link from "next/link"

const VideoCard = ({ video_info }) => {
  console.log("videocard", video_info)
  return (
    <div className="border-white border-1 my-2 p-2 flex flex-row rounded-4xl">
      <div className="bg-white ml-2 w-1/3 h-full">.</div>
      <div className="flex flex-col justify-between ml-2">
          <h1>Video Name: {video_info.video_name}</h1>
          <p>Duration: {video_info.duration}</p>
          <p>Topics: {video_info.topics.join("| ")}</p>
          <Link href={`/analysis/${video_info.video_name}`}>
            <button className="bg-blue-700 text-white mt-2 p-2 rounded">Process Video</button>
          </Link>
      </div>
    </div>
  )
}

export default VideoCard