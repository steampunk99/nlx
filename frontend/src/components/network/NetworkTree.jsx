import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Filter } from "lucide-react"
import '../../styles/globals.css'

// --- SVG Farm Icons ---
const CocoaPod = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="16" rx="12" ry="16" fill="#8B5C2A" stroke="#5C3310" strokeWidth="2" /><ellipse cx="16" cy="16" rx="8" ry="12" fill="#D2A86A" stroke="#8B5C2A" strokeWidth="1.5" /><ellipse cx="16" cy="16" rx="4" ry="8" fill="#F7E1B5" stroke="#D2A86A" strokeWidth="1" /></svg>
)
const Farmer = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="6" fill="#A7F3D0" stroke="#059669" strokeWidth="2" /><ellipse cx="16" cy="24" rx="10" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2" /></svg>
)
const FarmTreeIcon = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="24" rx="10" ry="6" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2" /><rect x="14" y="12" width="4" height="12" rx="2" fill="#C97C3A" /><ellipse cx="16" cy="12" rx="8" ry="8" fill="#A7F3D0" stroke="#059669" strokeWidth="2" /></svg>
)

// --- Tree Layout Helper (simple vertical, expandable) ---
function layoutTree(root, x=0, y=0, depth=0, spacingX=120, spacingY=100, nodes=[], links=[], parent=null) {
  // Each node: { ...data, x, y, depth, parentId }
  const id = root.id || Math.random().toString(36).slice(2)
  const children = Array.isArray(root.children) ? root.children : Object.values(root.children||{}).flat()
  nodes.push({ ...root, x, y, depth, parentId: parent?.id })
  if (parent) links.push({ source: parent.id, target: id })
  if (children && children.length) {
    // Center children horizontally
    const totalWidth = (children.length-1) * spacingX
    children.forEach((child, i) => {
      layoutTree(child, x - totalWidth/2 + i*spacingX, y+spacingY, depth+1, spacingX, spacingY, nodes, links, { ...root, id })
    })
  }
  return { nodes, links }
}

// --- Main Component ---
export default function NetworkTree({ networkData }) {
  // Pan/zoom state
  const [viewBox, setViewBox] = useState({ x: -200, y: -40, w: 600, h: 600 })
  const [drag, setDrag] = useState(null)
  const svgRef = useRef()
  // Node expansion state
  const [expanded, setExpanded] = useState({})
  // Info panel
  const [selected, setSelected] = useState(null)
  // Search/filter
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")

   const formatCurrency = (amount) => {
      // Parse the amount as a float to handle decimal strings
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) return '0';
      
      return new Intl.NumberFormat('en-UG', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericAmount);
    };
  
  // Layout tree (only expanded nodes)
  function filterTree(node) {
    if (!node) return null
    const id = node.id || Math.random().toString(36).slice(2)
    if (expanded[id] === false && node.children) return { ...node, children: [] }
    return { ...node, children: node.children ? Object.values(node.children).flat().map(filterTree) : [] }
  }
  const tree = layoutTree(filterTree(networkData||{}))

  // Pan/zoom handlers
  function onPointerDown(e) {
    if (e.button !== 0) return
    setDrag({ x: e.clientX, y: e.clientY, orig: { ...viewBox } })
  }
  function onPointerMove(e) {
    if (!drag) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    setViewBox(v => ({ ...v, x: drag.orig.x - dx, y: drag.orig.y - dy }))
  }
  function onPointerUp() { setDrag(null) }
  function onWheel(e) {
    e.preventDefault()
    const scale = e.deltaY < 0 ? 0.9 : 1.1
    setViewBox(v => ({
      x: v.x + (v.w * (1-scale))/2,
      y: v.y + (v.h * (1-scale))/2,
      w: v.w * scale,
      h: v.h * scale
    }))
  }
  // Touch pinch/drag
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let lastDist = null
    let lastMid = null
    function onTouchMove(e) {
      if (e.touches.length === 2) {
        const [a, b] = e.touches
        const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY
        const dist = Math.sqrt(dx*dx+dy*dy)
        const mid = { x: (a.clientX+b.clientX)/2, y: (a.clientY+b.clientY)/2 }
        if (lastDist) {
          const scale = lastDist/dist
          setViewBox(v => ({
            x: v.x + (v.w * (1-scale))/2,
            y: v.y + (v.h * (1-scale))/2,
            w: v.w * scale,
            h: v.h * scale
          }))
        }
        lastDist = dist
        lastMid = mid
      }
    }
    function onTouchEnd() { lastDist = null; lastMid = null }
    svg.addEventListener('touchmove', onTouchMove, { passive: false })
    svg.addEventListener('touchend', onTouchEnd)
    return () => {
      svg.removeEventListener('touchmove', onTouchMove)
      svg.removeEventListener('touchend', onTouchEnd)
    }
  }, [svgRef, viewBox])

  // Node click: expand/collapse or show info
  function handleNodeClick(node) {
    if (node.children && node.children.length) {
      setExpanded(e => ({ ...e, [node.id]: e[node.id] === false }))
    } else {
      setSelected(node)
    }
  }

  // Responsive height
  const svgHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 500 : 600

  return (
    <div className="relative w-full h-[70vh] min-h-[400px] bg-gradient-to-b from-[#e6f2ef] to-[#b6d7b0] rounded-2xl shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 rounded-xl shadow p-2 w-[95vw] max-w-md items-center">
        <Search className="w-5 h-5 text-[#8B5C2A]" />
        <input
          className="flex-1 bg-transparent outline-none text-[#4e3b1f] placeholder:text-[#A67C52]"
          placeholder="find farmers.."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
     
      </div>
      {/* SVG Tree */}
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        width="100%"
        height={svgHeight}
        className="touch-none select-none w-full h-full"
        style={{ background: 'none', zIndex: 1 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        {/* Edges */}
        {tree.links.map((l, i) => {
          const s = tree.nodes.find(n => n.id === l.source)
          const t = tree.nodes.find(n => n.id === l.target)
          if (!s || !t) return null
          return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#B6D7B0" strokeWidth={4} />
        })}
        {/* Nodes */}
        {tree.nodes.map((n, i) => {
          // Filter by search/filter
          if (search && !(n.user?.firstName?.toLowerCase().includes(search.toLowerCase()) || n.user?.lastName?.toLowerCase().includes(search.toLowerCase()))) return null
          if (filter !== "ALL" && n.status !== filter) return null
          return (
            <g key={n.id || i} tabIndex={0} aria-label={n.user?.firstName || 'Farmer'} role="button"
              onClick={() => handleNodeClick(n)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(n) }}
              className="cursor-pointer group"
            >
              <motion.g initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                {/* Node visuals */}
                <circle cx={n.x} cy={n.y} r={28} fill="#fffbe6" stroke="#8B5C2A" strokeWidth={3} />
                {n.status === "ACTIVE" ? <Farmer x={n.x-16} y={n.y-16} width={32} height={32} /> : <CocoaPod x={n.x-16} y={n.y-16} width={32} height={32} />}
                {/* Expand/collapse icon */}
                {n.children && n.children.length > 0 && (
                  <text x={n.x+20} y={n.y-20} fontSize={22} fill="#A67C52" fontWeight="bold">
                    {expanded[n.id] === false ? '+' : '-'}
                  </text>
                )}
              </motion.g>
              {/* Name label */}
              <text x={n.x} y={n.y+44} textAnchor="middle" fontSize={16} fill="#4e3b1f" fontWeight="bold">
                {n.user?.firstName || 'Farmer'} {n.user?.lastName || ''}
              </text>
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 rounded-xl shadow p-3 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2"><CocoaPod className="w-5 h-5" /> Inactive</div>
        <div className="flex items-center gap-2"><Farmer className="w-5 h-5" /> Active</div>
        <div className="flex items-center gap-2"><FarmTreeIcon className="w-5 h-5" /> Your Farm</div>
        <div className="text-[#A67C52] mt-1">Drag to pan, scroll/pinch to zoom, tap node for details</div>
      </div>
      {/* Info Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed md:absolute bottom-0 right-0 md:top-0 md:bottom-auto md:w-96 w-full z-30 bg-white border-l-4 border-[#b6d7b0] rounded-t-2xl md:rounded-t-none md:rounded-l-2xl shadow-2xl p-6"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 bg-[#e6f2ef] rounded-full p-2"><X className="w-5 h-5 text-[#8B5C2A]" /></button>
            <div className="flex items-center gap-3 mb-4">
              {selected.status === "ACTIVE" ? <Farmer className="w-10 h-10" /> : <CocoaPod className="w-10 h-10" />}
              <div>
                <div className="font-bold text-lg text-[#4e3b1f]">{selected.user?.firstName} {selected.user?.lastName}</div>
                <div className="text-[#A67C52] text-xs">{selected.status}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold text-[#8B5C2A]">Farm Name:</span> {selected.package?.name || 'N/A'}</div>
              <div><span className="font-semibold text-[#8B5C2A]">Net-worth:</span> {formatCurrency(selected.package?.price ?? '0')}</div>
              <div><span className="font-semibold text-[#8B5C2A]">Status:</span> {selected.status}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}