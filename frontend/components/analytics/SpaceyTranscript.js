'use client'
import { useState, useEffect } from "react"

export default function SpaceyTranscript() {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + "/fetch_transcript"
    const [transcript, setTranscript] = useState(null);
    useEffect(() => {
        async function fetchTranscript() {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTranscript(data['html']);
                console.log(data);
            } catch (error) {
                console.error("Error fetching transcript:", error);
            }
        }
        fetchTranscript();
    }, [])

    return (
        <div dangerouslySetInnerHTML={{ __html: transcript }}>
        </div>
    )
}