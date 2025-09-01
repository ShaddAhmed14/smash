import AnalysisPage from '@/pages/AnalysisPage'

interface PageProps {
  params: {
    video_name: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { video_name } = await params

  return (
    <AnalysisPage video_name={video_name} />
  )
}

export default page