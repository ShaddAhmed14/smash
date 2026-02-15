import PreviewModule from '@/pages/PreviewModule'

export default async function Page({ params }) {
  const {video_name} = await params

  return (
      <PreviewModule video_name={video_name} />
  )
}