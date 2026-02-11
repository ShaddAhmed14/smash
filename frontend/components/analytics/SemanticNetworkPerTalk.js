import {memo, useState, useEffect} from 'react'
import SemanticNetworkTemplate from '@/components/analytics/SemanticNetworkTemplate'

export default memo(function SemanticNetworkPerTalk({}) {
    const [videoList, setVideoList] = useState([])
    const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + `/fetch_pertalk_list`
    fetch(url)
    .then(response => {
    return response.json().then(fetchedData => {
      if (!response.ok) {
        console.error("Error fetching per-talk list:", fetchedData.message);
      } else {
        if (fetchedData.video_names && fetchedData.video_names.length > 0) {
            setVideoList(fetchedData.video_names.slice(0, 10));
            setSelectedVideo(fetchedData.video_names[0]);
        }
      }
    });
  })
  .catch(error => {
    console.error("Error fetching per-talk list:", error);
  });
  }, []);

return (
    <>
    <div className="h-full bg-primary flex flex-col">
        <select name="Videos" onChange={(e) => setSelectedVideo(e.target.value)} defaultValue={selectedVideo} className="bg-secondary w-1/2 text-[0.875rem] border-primary m-2 py-0.5 px-2 h-8 ">
            {
                videoList.map((video, idx) => (
                <option key={idx} value={video}>{video}</option>
            ))}
        </select>
        {selectedVideo &&
        <SemanticNetworkTemplate type={selectedVideo} />
        }
    </div></>
)
})