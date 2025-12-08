import {TailSpin} from 'react-loader-spinner'

const Loader = ({name}) => {
  return (
    <div className='flex flex-row justify-center gap-x-5 items-center h-[100vh] w-full'>
        <TailSpin
            height="100"
            width="100"
            color="#000000ff"
            wrapperClass="align-middle"
        />
        Loading {name}...
    </div>
  )
}

export default Loader