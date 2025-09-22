'use client'
import PreviewPillar from "@/pages/PreviewPillar";

import {createContext} from "react"
export const VideoContext = createContext()

export default function Home() {
  return (
    <div className="">
      <PreviewPillar />
    </div>
  );
}
