import PreviewModule from '@/pages/PreviewModule'

export default async function Page({ params }) {
  const {video_name} = await params
  console.log("Page render:", video_name)

  return (
      <PreviewModule video_name={video_name} />
  )
}