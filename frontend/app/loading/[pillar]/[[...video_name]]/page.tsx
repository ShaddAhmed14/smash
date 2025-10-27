import LoadingPage from "@/pages/LoadingPage"
interface PageProps {
  params: {
    pillar: string
    video_name? : string[] // optional parameter
  }
}
const page = async ({ params }: PageProps) => {
  const all_params = await params
  const video_name = all_params.video_name?.[0]
  const pillar = all_params.pillar

  return (
    <LoadingPage pillar={pillar} video_name={video_name} />
  )
}

export default page