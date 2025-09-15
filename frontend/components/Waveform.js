"use client";
import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import { AudioVisualizer } from 'react-audio-visualize';

export default function Waveform({video_name, videoRef=null}) {
  const [data, setData] = useState(null);
  // const [currentTime, setCurrentTime] = useState(0)
  
  useEffect(() => {
    const api =  process.env.NEXT_PUBLIC_BACKEND_URL +  "fetch_waveform?=video_name=" + video_name 
    fetch(api) 
      .then((res) => res = res.json())
      .then((data) => {
        console.log("audio data", data)
        setData({...data})
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, [video_name]);
  
  // useEffect(() => {
  //   let refId
  //   const updateTime = () => {
  //     if(videoRef.current ){
  //       setCurrentTime(videoRef.current.currentTime)
  //     }
  //     refId = requestAnimationFrame(updateTime)
  //   }
  //   refId = requestAnimationFrame(updateTime)
  //   return () => cancelAnimationFrame(refId)
  // }, [videoRef])

  if (!data) return <div>Loading...</div>;
  
  return (
      <div className='w-fit flex flex-row justify-between'>
          {data ?
          // <Plot
          //   data={[
          //     {
          //       x: data.times,
          //       y: data.waveform,
          //       type: 'scatter',
          //       mode: 'lines',
          //       line: { color: 'blue' },
          //     },
          //   ]}

          //   layout={{
          //     dragmode: 'zoom',
          //       xaxis: { title: {text: 'Time (s)'}},
          //       yaxis: { title: {text: 'Amplitude'} },          
          //       title: { text: 'Waveform' },  
          //       // shapes: [ 
          //       //   {
          //       //     type: 'line',
          //       //     x0: currentTime,
          //       //     x1: currentTime,
          //       //     y0: 1,
          //       //     y1: -1,
          //       //     line: {
          //       //       color: "black", width: 4, dash:"dashdot"
          //       //     }
          //       //   }     
          //       // ]        
          //   }}
          // />
          <></>
           : 
            <div> Select a Video to Analyze </div>
          }
        </div>
  );
}