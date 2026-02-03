'use client'
import { useState, useEffect, memo } from "react"
import SpaceyTranscriptDependancyTree from "./SpaceyTranscriptDependancyTree"

export default memo(function SpaceyTranscript() {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_spacey?video_name=0123"
    const [transcript, setTranscript] = useState(null);
    const [selectedSentence, setSelectedSentence] = useState(null);
    const url_dependency_tree = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + `/fetch_dependency_tree?video_name=0123&sentence_id=${selectedSentence}`

    const ENTITY_COLORS = {
        'PERSON': '#A61C3C',
        'ORG': '#08bdba',
        'GPE': '#F4AC45',
        'DATE': '#8a3ffc',
        'MONEY': '#33b1ff',
        'PERCENT': '#007d79',
        'PRODUCT': '#ff7eb6',
        'EVENT': '#fa4d56',
        'LOC': '#6fdc8c',
        'NORP': '#d4bbff',
        'FAC': '#bae6ff',
        'CARDINAL': '#e8daff',
        'ORDINAL': '#d0e2ff',
        'QUANTITY': '#a7f0ba',
        'TIME': '#ffd6e8'
        }
    useEffect(() => {
        async function fetchTranscript() {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTranscript(data);
            } catch (error) {
                console.error("Error fetching transcript:", error);
            }
        }
        fetchTranscript();
    }, [])

    const renderTokens = (tokens) => {
        return tokens.map((token, idx) => {
            if(!token.label){return <span key={idx}>{token.text}{token.trailing_space}</span>}
            return (
                <span key={idx} className="rounded inline-block px-1" 
                style={{ backgroundColor: ENTITY_COLORS[token.label] || 'transparent' }}>
                    {token.text} &nbsp;
                    <span className="text-sm font-semibold">{token.label}</span>
                </span>
            )
    })}
        
    
    if (!transcript) return <div>Loading...</div>;

    return (
        <div className="w-full h-full grid grid-rows-2 gap-2 m-2">
            <div className="overflow-y-auto bg-primary p-2">
                {transcript.map(({id, tokens}) => (
                    <span key={id} className={`hover:font-bold cursor-pointer ${selectedSentence === id ? "font-bold" : ""}`} onClick={() => setSelectedSentence(id)}>
                        {renderTokens(tokens)} &nbsp;
                    </span>
                ))}
            </div>
            <div className="p-2 italic bg-primary mb-4">
                {selectedSentence==null ? 'Click a sentence to view its dependency parse tree.' : 
                <SpaceyTranscriptDependancyTree video_name="0123" sentence_id={selectedSentence} />}
            </div>
        </div>
    )
})