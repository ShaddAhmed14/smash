"use client"
// loader needs client directive since library uses contexts
import Loader from '@/components/Loader'

export default function Loading() {
  return (
    <Loader name={"Analysis Module"} />
  )
}