const Loader = ({name}) => {
  return (
    <div className='flex flex-col justify-center gap-4 items-center h-screen w-full'>
      <div className="border-4 border-[color:var(--border-primary)] border-t-[color:var(--button-primary)] rounded-full animate-spin w-10 h-10" />
      <p className="carbon-heading-03 text-[color:var(--text-primary)]">Loading {name}...</p>
    </div>
  )
}

export default Loader
