'use client'
import LandingPage from "@/pages/LandingPage"

import {createContext} from "react"
export const VideoContext = createContext()

export default function Home() {
  return (
    <div className="">
      <LandingPage />
    </div>
  );
}
