import { memo, useState } from "react"
export default memo(function SpaceyTranscriptDependancyTree({video_name, sentence_id}) {
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({x: 0, y: 0})
    const [dragging, setDragging] = useState(false)
    const [dragStart, setDragStart] = useState({x: 0, y: 0})
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + `/fetch_dependency_tree?video_name=${video_name}&sentence_id=${sentence_id}`

    const handleWheel = (e) => {
        e.preventDefault()
        const scaleAmount = -e.deltaY * 0.001
        setZoom(prevZoom => Math.min(Math.max(prevZoom + scaleAmount, 0.5), 3))
    }
    
    const handleMouseDown = (e) => {
        setDragging(true)
        setDragStart({x: e.clientX - offset.x, y: e.clientY - offset.y})
    }
    const handleMouseMove = (e) => {
        if (dragging) {
            setOffset({x: e.clientX - dragStart.x, y: e.clientY - dragStart.y})
        }
    }
    const handleMouseUp = () => {
        setDragging(false)
    }
    return (
        <div
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-[90%] h-full mx-auto overflow-hidden cursor-grab active:cursor-grabbing"
        >
            <img src={url} alt="Dependency Tree" className="w-full h-auto object-contain" draggable={false}
                style={{ transform: `translate(${offset.x/zoom}px, ${offset.y/zoom}px) scale(${zoom})` }} 
            />
        </div>
    ) 
})