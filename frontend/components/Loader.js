// import {TailSpin} from 'react-loader-spinner'

const Loader = ({name}) => {
  return (
    <div className='flex flex-col justify-center gap-y-5 items-center h-[100vh] w-full'>
      <div className="border-8 border-secondary border-t-primary rounded-full animate-spin w-16 h-16" />
      <p className="text-xl text-primary">Loading {name}...</p>
    </div>
  )
}

export default Loader
    // <div className='flex flex-row justify-center gap-x-5 items-center h-[100vh] w-full'>
    //     {/* <TailSpin
    //         height="100"
    //         width="100"
    //         color="#000000ff"
    //         wrapperClass="align-middle"
    //     /> */}
    //     Loading {name}...
    // </div>