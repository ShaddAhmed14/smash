import PreviewModule from '@/pages/PreviewModule'

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
      <PreviewModule video_name={video_name} />
      // <PreviewModule video_name={video_name as any} />
  )
}