import {useState, useEffect, memo, useMemo} from 'react';
import { SigmaContainer, useLoadGraph, useSigma } from '@react-sigma/core';
import '@react-sigma/core/lib/style.css';
import { MultiDirectedGraph as MultiGraphConstructor } from 'graphology';
import Loader from '../Loader';

function GraphEvents({setHoveredNode, setSelectedNode}) {
  const sigma = useSigma();
  useEffect(() => {
    const handleMouseEnter = (e) => {
      setHoveredNode(e.node);
    }
    const handleMouseLeave = () => {
      setHoveredNode(null);
    }
    const handleClick = (e) => {
      setSelectedNode(prev => prev === e.node ? null : e.node);
    }

    sigma.on('enterNode', handleMouseEnter);
    sigma.on('leaveNode', handleMouseLeave);
    sigma.on('clickNode', handleClick);

    return () => {
      sigma.removeListener('enterNode', handleMouseEnter);
      sigma.removeListener('leaveNode', handleMouseLeave);
      sigma.removeListener('clickNode', handleClick);
    }
  }, [sigma, setHoveredNode, setSelectedNode]);
  return null;
}

function GraphFilter({hoveredNode, selectedNode}) { 
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    const activeNode = selectedNode || hoveredNode;
    if (!activeNode) {
      graph.forEachNode((node) => {
        graph.setNodeAttribute(node, 'highlighted', true);
      });
      graph.forEachEdge((edge) => {
        graph.setEdgeAttribute(edge, 'highlighted', true);
      });
    }
    else {
      const neighbors = new Set(graph.neighbors(activeNode));
      const connectedEdges = new Set(graph.edges(activeNode));
      neighbors.add(activeNode);

      graph.forEachNode((node) => {
        const isHighlighted = neighbors.has(node);
        graph.setNodeAttribute(node, 'highlighted', isHighlighted);
      });
      graph.forEachEdge((edge) => {
        const isHighlighted = connectedEdges.has(edge);
        graph.setEdgeAttribute(edge, 'highlighted', isHighlighted);
      });
    }
    sigma.refresh();
  }, [graph, sigma, hoveredNode, selectedNode]);

  useEffect(() => {
    sigma.setSetting('nodeReducer', ((node, attributes) => {
      if (!attributes.highlighted) {
        let label = attributes.label || node
        label = attributes.size < 15 ? null : label
        return {...attributes, color: '#e0e0e0'};
      }
      return attributes
    }))
    sigma.setSetting('edgeReducer', (edge, attributes) => {
      if (!attributes.highlighted) {
        return {...attributes, color: '#e0e0e0', width: 0.5, };
      }
      return attributes;
    })
    return () => {
      sigma.setSetting('nodeReducer', undefined);
      sigma.setSetting('edgeReducer', undefined);
    }
  }, [sigma]);

  return null;
}

function Tooltip({hoveredNode}) {
  const sigma = useSigma();
  const [position, setPosition] = useState({x: 0, y: 0});

  useEffect(() => {
    if (!hoveredNode) return;
    const attrs = sigma.getGraph().getNodeAttributes(hoveredNode);
    setPosition({x: attrs.x, y: attrs.y});
  }, [hoveredNode, sigma]);

  if (!hoveredNode) return null;
  const label = sigma.getGraph().getNodeAttribute(hoveredNode, 'label') || hoveredNode;

  return (
    <div
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        backgroundColor: 'var(--bg-secondary)',
        fontFamily: 'var(--font-family-sans)',
        padding: '4px 8px',
        margin: '4px 8px',
        borderRadius: '4px',
        color: 'var(--text-primary)',
        pointerEvents: 'none',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        zIndex: 10,
      }}
    >
      {label}
    </div>
  )
}

function GraphLoader({data}) {
  const loadGraph = useLoadGraph()
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!data) return;
    
    const graph = new MultiGraphConstructor();
    for (const node of data.node_traces) {
      if(node[0] && node[1]) {
        graph.addNode(node[0], {...node[1], highlighted: true});
      }
      else {
        console.warn("Invalid node data:", node);
      }
    }
    for (const edge of data.edge_traces) {
      graph.addEdge(edge[0], edge[1], {highlighted: true});
    }

    // load the graph in sigma
    loadGraph(graph);
  }, [loadGraph, data])

  useEffect(() => {
    const labelCanvas = document.querySelectorAll('.sigma-hovers');
    if (labelCanvas) {
      labelCanvas.forEach(canvas => {canvas.style.display = 'none';}
      );
    }
  }, []);

  return (
    <>
      <GraphEvents setHoveredNode = {setHoveredNode} setSelectedNode = {setSelectedNode}/>
      <GraphFilter hoveredNode = {hoveredNode} selectedNode = {selectedNode}/>
      <Tooltip hoveredNode = {hoveredNode}/>
    </>
  ) 
}

export default memo(function SemanticNetworkTemplate({type}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null)
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_ANALYTICS + `/fetch_semantic_network?type=${type.toLowerCase()}`

  useEffect(() => {
    fetch(url)
        .then(response => {
        return response.json().then(fetchedData => {
          if (!response.ok) {
            throw new Error(fetchedData.message || response.statusText);
          }
          return fetchedData;
        });
      })
    .then(fetchedData => {
        setData(fetchedData)
    })
    .catch(err => {
        console.log("Fetch error:", err);
        setError(err.message || err.toString());
      })
    }, [url])

  const settings = useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue('--bg-secondary').trim();
    const nodeColor = styles.getPropertyValue('--custom-analytics-dark').trim();
    const fontFamily = styles.getPropertyValue('--font-family-sans').trim();
    const fontColor = styles.getPropertyValue('--text-primary').trim();

    // https://github.com/jacomyal/sigma.js/blob/main/packages/sigma/src/settings.ts
    return {
      allowInvalidContainer: true,
      renderLabels: true,
      labelRenderedSizeThreshold: 15,
      defaultNodeColor: nodeColor,
      labelFont: fontFamily,

      defaultDrawNodeLabel: (context, data, settings) => {
        if(!data.label || !data.highlighted) return;

        const padding = 4;
        const borderRadius = 4;
        const fontSize = settings.labelSize;
        context.font = `${fontSize}px ${settings.labelFont}`;
        const textWidth = context.measureText(data.label).width;

        const x = data.x + data.size + 4;
        const y = data.y - (fontSize / 2);

        context.fillStyle = bgColor;
        context.beginPath();
        context.roundRect(x - padding, y - padding, textWidth + 3 * padding, fontSize + 3 * padding, borderRadius);
        context.fill();
        
        context.fillStyle = fontColor;
        context.fillText(data.label, x, y + fontSize);
      }
    }},
    [],
  );

  return (
    error ?
    <p className="m-2 text-md">Error loading Data Map plot: {error.toString()}</p>
    :
    <div className="relative w-full h-full m-2 bg-primary flex flex-col">
      <p className="font-semibold text-[0.9375rem] border-b-2 border-(--custom-analytics-dark) py-3 px-4">{type}</p>
      {!data ? <Loader name={type} /> : 
      <div className="flex-1 overflow-hidden">
        <SigmaContainer settings={settings} style={{height: "100%", width: "100%", backgroundColor: "var(--bg-primary)"}}>
          <GraphLoader data={data} />
        </SigmaContainer>    
      </div>
      }
    </div>
  )
})