const Loader = ({name}) => {
  return (
    <div className='flex flex-col justify-center gap-y-5 items-center h-screen w-full'>
      <div className="border-8 border-secondary border-t-primary rounded-full animate-spin w-16 h-16" />
      <p className="text-xl text-primary">Loading {name}...</p>
    </div>
  )
}

export default Loader