import { FaGithub } from 'react-icons/fa'
import Link from 'next/link'

const Footer = () => {
  return (
    <div className=" bottom-0 left-0 w-full border-t-1 border-foreground z-50 bg-secondary">
            <div className="flex flex-row justify-between items-center w-full px-10 py-4 text-foreground">
                <div>
                    <p className="ml-10"> &copy; 2025 SMASH • Synthesis and Multimodal Analytics System for Humanities</p>
                </div>
                <div className="flex flex-row justify-evenly items-center gap-6">
                    <Link href={'https://github.com/'} className="flex flex-row items-center gap-2">
                        <FaGithub /> Github
                    </Link>
                    <Link href={'/documentation/'} className="">
                        Documentation
                    </Link>
                    <Link href={'https://www.ru.nl/'} className="">
                        Ratboud University
                    </Link>
                </div>
            </div>
        </div>
  )
}

export default Footer