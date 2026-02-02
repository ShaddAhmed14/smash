'use client'
import SemanticNetworkTemplate from '@/components/analytics/SemanticNetworkTemplate'
import {useState, memo} from 'react'

export default memo(function SemanticNetwork({plot_name}) {
  const [option, setOption] = useState('pertalk')
  return (
    <div className="w-full h-9/10 flex flex-col">
      <div className="flex flex-row gap-4 m-4">
        <h2 onClick={() => setOption('pertalk')} className={`plot-option-pill hover:bg-primary 
          ${option === 'pertalk' ? 'bg-primary font-semibold border-2 border-(--button-primary)' : 'bg-secondary border-(--bg-primary)'}`}>Per-Talk</h2>
        <h2 onClick={() => setOption('crosstalk')} className={`plot-option-pill hover:bg-primary 
          ${option === 'crosstalk' ? 'bg-primary font-semibold border-2 border-(--button-primary)' : 'bg-secondary border-(--bg-primary)'}`}>Cross-Talk</h2>
      </div>
      {
        option === 'crosstalk' ?
        <div className="h-full flex flex-row justify-around">
          {/* <SemanticNetworkTemplate type={"TFIDF"} /> */}
          <SemanticNetworkTemplate type={"SBERT"} />
        </div>
        :
        <div className="h-full">
          <SemanticNetworkTemplate type={"pertalk"} />
        </div>
      }  
    </div>
  )
})