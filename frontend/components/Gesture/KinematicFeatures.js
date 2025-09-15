'use client'
// https://github.com/WimPouw/envisionhgdetector/blob/main/envisionhgdetector/dashboard/app.py#L357

import { useEffect, useState } from "react"
import KinematicFeaturesGraph from "./KinematicFeaturesGraph";

const KinematicFeatures = ({video_name}) => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + '/fetch_kinematic_features?video_name=' + video_name
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setData({"x": data.x, "y": data.y})
      })
  }, [url])
  return (
    <div className="grid grid-cols-3 gap-4">
      {
        data ? 
        Object.entries(data.y).map(([feature_name, feature_values], index) => (
          <div key={index} className="m-2">
            <KinematicFeaturesGraph x={data.x} y={feature_values} title={feature_name} x_label="Jitter Values" y_label={feature_name}/>
          </div>
        )): null
      }
    </div>
  )
}

export default KinematicFeatures