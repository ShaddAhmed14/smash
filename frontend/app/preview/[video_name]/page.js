import PreviewPillar from '@/pages/PreviewPillar'

// interface PageProps {
//   params: Promise<{
//     video_name: string;
//   }>;
// }

// export default async function Page({ params }: PageProps) {
export default async function Page({ params }) {
  const {video_name} = await params
  console.log("Page render:", video_name)

  return (
      <PreviewPillar video_name={video_name} />
      // <PreviewPillar video_name={video_name as any} />
  )
}