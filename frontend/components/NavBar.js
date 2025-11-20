import Link from "next/link"

const NavBar = ({currentPage}) => {
    let style = "hover:bg-gray-200 cursor-pointer mr-4 p-4"
  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="flex flex-row justify-between items-center">
            <div className="my-3 mx-4">
                <Link href={'/'} className="text-2xl cursor-pointer" >
                    SMASH
                </Link>
            </div>
            <div className={`flex flex-row gap-6`}>
                {currentPage != "Preview" ?
                <Link href={'/video_library/'} className={style} >
                    Preview Pillar
                </Link> : null}
                {currentPage != "Analysis" ?
                <Link href={'/analysis/'} className={style} >
                    Analysis Pillar
                </Link> : null}
                {currentPage != "Analytics" ?
                <Link href={'/analytics/'} className={style} >
                    Analytics Pillar
                </Link> : null}
          </div>
        </div>

    </div>
  )
}

export default NavBar