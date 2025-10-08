import LoadingPage from "@/pages/LoadingPage"
interface PageProps {
  params: {
    pillar: string
    video_name: string
  }
}
const page = async ({ params }: PageProps) => {
  const { pillar, video_name } = await params

  return (
    <LoadingPage pillar={pillar} video_name={video_name} />
  )
}

export default page