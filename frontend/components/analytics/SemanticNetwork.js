'use client'
import SemanticNetworkTemplate from '@/components/analytics/SemanticNetworkTemplate'
import SemanticNetworkPerTalk from '@/components/analytics/SemanticNetworkPerTalk'
import {useState, memo} from 'react'

export default memo(function SemanticNetwork({plot_name}) {
  const [option, setOption] = useState('pertalk')
  return (
    <div className="max-w-full h-9/10 flex flex-col m-4">
      <div className="mb-2 flex flex-row gap-4">
        <h2 onClick={() => setOption('pertalk')} className={`plot-option-pill hover:bg-primary 
          ${option === 'pertalk' ? 'bg-primary font-semibold border-2 border-(--button-primary)' : 'bg-secondary border-(--bg-primary)'}`}>Per-Talk</h2>
        <h2 onClick={() => setOption('crosstalk')} className={`plot-option-pill hover:bg-primary 
          ${option === 'crosstalk' ? 'bg-primary font-semibold border-2 border-(--button-primary)' : 'bg-secondary border-(--bg-primary)'}`}>Cross-Talk</h2>
      </div>
      {
        option === 'crosstalk' ?
        <div className="h-full flex flex-row justify-around">
          <div className="w-full h-full m-2 bg-primary flex flex-col">
            <p className="font-semibold text-[0.9375rem] border-b-2 border-(--custom-analytics-dark) py-3 px-4">{"TFIDF"}</p>
            <SemanticNetworkTemplate type={"TFIDF"} />
          </div>
          <div className="w-full h-full m-2 bg-primary flex flex-col">
            <p className="font-semibold text-[0.9375rem] border-b-2 border-(--custom-analytics-dark) py-3 px-4">{"SBERT"}</p>
            <SemanticNetworkTemplate type={"SBERT"} />
          </div>
        </div>
        :
        <div className="h-full">
          <SemanticNetworkPerTalk />
        </div>
      }  
    </div>
  )
})