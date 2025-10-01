import PreviewPillar from '@/pages/PreviewPillar'

interface PageProps {
  params: {
    video_name: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { video_name } = await params

  return (
    <PreviewPillar video_name={video_name} />
  )
}

export default page