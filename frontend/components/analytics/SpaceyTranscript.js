'use client'
import { useState, useEffect, memo } from "react"
import SpaceyTranscriptDependancyTree from "./SpaceyTranscriptDependancyTree"

export default memo(function SpaceyTranscript() {
    const [transcript, setTranscript] = useState(null);
    const [selectedSentence, setSelectedSentence] = useState(null);
    const [videoList, setVideoList] = useState([])
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [error, setError] = useState(null)

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
        const list_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + `/fetch_spacey_list`
        fetch(list_url)
        .then(response => {
        return response.json().then(fetchedData => {
        if (!response.ok) {
            throw new Error(fetchedData.message || response.statusText);
          } else {
            if (fetchedData.video_names && fetchedData.video_names.length > 0) {
                setVideoList(fetchedData.video_names.slice(0, 10));
                setSelectedVideo(fetchedData.video_names[0]);
            }
        }
        });
    })
    .catch(error => {
        console.error("Error fetching per-talk list:", error);
        setError(error.message || error.toString());
    });
    }, []);

    useEffect(() => {
        if (!selectedVideo) return;
        async function fetchTranscript() {
            const transcript_url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_spacey?video_name=" + selectedVideo
            try {
                const response = await fetch(transcript_url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTranscript(data);
            } catch (error) {
                console.error("Error fetching transcript:", error);
                setError(error.message || error.toString());
            }
        }
        fetchTranscript();
    }, [selectedVideo])

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

    return (
        <>
        <select name="Videos" onChange={(e) => {setSelectedVideo(e.target.value); setSelectedSentence(null)}} defaultValue={selectedVideo} className="text-[0.875rem] border-primary w-2/3 m-2 py-0.5 px-2 h-8 bg-secondary absolute top-0 right-0 z-10">
        {
            videoList.map((video, idx) => (
            <option key={idx} value={video}>{video}</option>
        ))}
        </select>
        {error && <p className="m-2 text-md">Error loading Spacey Transcript: {error.toString()}</p>}
        {
            transcript &&
            <div className="max-w-full max-h-full flex flex-col gap-2 p-2">
                <div className="overflow-y-auto bg-primary p-2 h-5/10">
                    {transcript.map(({id, tokens}) => (
                        <span key={id} className={`hover:font-bold cursor-pointer ${selectedSentence === id ? "font-bold" : ""}`} onClick={() => setSelectedSentence(id)}>
                            {renderTokens(tokens)} &nbsp;
                        </span>
                    ))}
                </div>
                <div className="h-4/10 flex items-center max-h-90% overflow-hidden mx-auto font-semibold italic">
                    {selectedSentence==null ? 'Click a sentence to view its dependency parse tree.' : 
                    <SpaceyTranscriptDependancyTree video_name={selectedVideo} sentence_id={selectedSentence} />}
                </div>
            </div>
        }
        </>
    )
})