import Link from "next/link"
const Homepage = () => {
  return (
    <div className='flex flex-col gap-10 items-center justify-between m-5'>
        <div>
            <h1 className='text-4xl font-bold'>SMASH</h1>
            <p className='text-lg mt-5'>SMASH IS LOREM IPSUM</p>
        </div>
        <div>
            <Link href="/video_library">
                <button className='bg-blue-900 text-white py-2 px-4 rounded border-1 border-red-600'>Visit Our Video Library</button>
            </Link>
        </div>
        <div className='w-full'>
            <h1 className='text-2xl font-bold'>Features:</h1>
            <div className='grid grid-cols-2'>
                <div className='bg-white border-black border-2'>Placeholder 1</div>
                <div className='bg-white border-black border-2'>Placeholder 2</div>
                <div className='bg-white border-black border-2'>Placeholder 3</div>
                <div className='bg-white border-black border-2'>Placeholder 4</div>

            </div>
        </div>
    </div>
  )
}

export default Homepage