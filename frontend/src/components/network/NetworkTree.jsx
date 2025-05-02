"use client"

import { useRef, useState, useEffect, useMemo, Suspense } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  Text,
  Sphere,
  MeshDistortMaterial,
  Trail,
  Billboard,
  Stars,
  Line,
  useCursor,
  Environment,
} from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Trophy, Zap, Search, Filter, ChevronDown, X, Home, User, Settings, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSpring, animated } from "@react-spring/three"

// Node material variants based on status
const NODE_MATERIALS = {
  ROOT: {
    color: "#ff00ff", // Magenta
    emissive: "#ff00ff",
    emissiveIntensity: 0.8,
    distort: 0.3,
    speed: 2,
    roughness: 0.2,
    metalness: 0.8,
    glow: 1.5,
    size: 1.8,
  },
  ACTIVE: {
    color: "#00ffff", // Cyan
    emissive: "#00ffff",
    emissiveIntensity: 0.6,
    distort: 0.2,
    speed: 1.5,
    roughness: 0.3,
    metalness: 0.7,
    glow: 1.2,
    size: 1.4,
  },
  INACTIVE: {
    color: "#b19fff", // Lavender
    emissive: "#b19fff",
    emissiveIntensity: 0.3,
    distort: 0.1,
    speed: 1,
    roughness: 0.5,
    metalness: 0.5,
    glow: 0.8,
    size: 1.2,
  },
}

// Connection line variants based on status
const CONNECTION_MATERIALS = {
  ROOT: {
    color: "#ff00ff",
    width: 3,
    speed: 2,
    opacity: 0.8,
  },
  ACTIVE: {
    color: "#00ffff",
    width: 2,
    speed: 1.5,
    opacity: 0.7,
  },
  INACTIVE: {
    color: "#b19fff",
    width: 1.5,
    speed: 1,
    opacity: 0.5,
  },
}

// Node component with advanced effects
const Node = ({ node, position, onClick, isSelected, isHovered, searchMatch }) => {
  const meshRef = useRef()
  const glowRef = useRef()
  const status = node.status || "INACTIVE"
  const material = NODE_MATERIALS[status]
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  // Animation for node scale
  const { scale } = useSpring({
    scale: isSelected ? 1.3 : isHovered || hovered ? 1.15 : 1,
    config: { mass: 1, tension: 280, friction: 60 },
  })

  // Animation for glow intensity
  const { intensity } = useSpring({
    intensity: isSelected ? 1.5 : isHovered || hovered ? 1.2 : 1,
    config: { mass: 1, tension: 280, friction: 60 },
  })

  // Distortion animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate the node
      meshRef.current.rotation.y += delta * 0.2 * material.speed

      // Update distortion factor based on selection/hover state
      if (meshRef.current.material) {
        meshRef.current.material.distort = THREE.MathUtils.lerp(
          meshRef.current.material.distort,
          isSelected ? material.distort * 1.5 : isHovered || hovered ? material.distort * 1.2 : material.distort,
          delta * 4,
        )
      }

      // Update glow
      if (glowRef.current) {
        glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
      }
    }
  })

  // Highlight nodes that match search
  const nodeColor = searchMatch ? "#ffffff" : material.color
  const nodeEmissive = searchMatch ? "#ffffff" : material.emissive
  const emissiveIntensity = searchMatch ? 1.2 : material.emissiveIntensity

  return (
    <animated.group position={position} scale={scale}>
      {/* Main node sphere with distortion effect */}
      <Sphere
        ref={meshRef}
        args={[material.size, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(node)}
      >
        <MeshDistortMaterial
          color={nodeColor}
          emissive={nodeEmissive}
          emissiveIntensity={emissiveIntensity}
          roughness={material.roughness}
          metalness={material.metalness}
          distort={material.distort}
          speed={material.speed}
        />
      </Sphere>

      {/* Outer glow effect */}
      <Sphere ref={glowRef} args={[material.size * 1.3, 32, 32]}>
        <meshBasicMaterial color={nodeColor} transparent opacity={0.15} />
      </Sphere>

      {/* Node label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, material.size * 1.8, 0]}
          fontSize={0.8}
          color={nodeColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
          outlineOpacity={0.8}
        >
          {`${node.user?.firstName || "Unknown"} ${node.user?.lastName || ""}`}
        </Text>

        {/* Show additional info when hovered or selected */}
        {(isHovered || hovered || isSelected) && (
          <Text
            position={[0, material.size * 1.3, 0]}
            fontSize={0.6}
            color={nodeColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            outlineOpacity={0.8}
          >
            {node.package?.name || "No Package"} • Level {node.level}
          </Text>
        )}
      </Billboard>

      {/* Highlight effect for search matches */}
      {searchMatch && (
        <group>
          <Sphere args={[material.size * 1.5, 32, 32]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
          </Sphere>
          <Trail
            width={5}
            color="#ffffff"
            length={8}
            decay={1}
            local={false}
            stride={0}
            interval={1}
            attenuation={(width) => width}
          >
            <Sphere args={[0.1, 16, 16]} position={[0, material.size * 2.5, 0]}>
              <meshBasicMaterial color="#ffffff" />
            </Sphere>
          </Trail>
        </group>
      )}
    </animated.group>
  )
}

// Connection component with animated flow effect
const Connection = ({ start, end, status = "INACTIVE", isHighlighted }) => {
  const ref = useRef()
  const material = CONNECTION_MATERIALS[status]
  const [curve] = useState(() => {
    // Create a curved path between nodes
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)

    // Add some height to the curve
    const distance = startVec.distanceTo(endVec)
    midPoint.y += distance * 0.2

    const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec)
    return curve
  })

  // Animation for the connection
  useFrame((state) => {
    if (ref.current && ref.current.material) {
      // Animate the dash offset for a flowing effect
      ref.current.material.dashOffset -= 0.01 * material.speed

      // Adjust line width based on highlight state
      ref.current.material.linewidth = THREE.MathUtils.lerp(
        ref.current.material.linewidth,
        isHighlighted ? material.width * 1.5 : material.width,
        0.1,
      )
    }
  })

  // Generate points along the curve
  const points = useMemo(() => curve.getPoints(50), [curve])

  return (
    <Line
      ref={ref}
      points={points}
      color={material.color}
      lineWidth={material.width}
      dashed
      dashSize={0.5}
      dashScale={10}
      dashOffset={0}
      transparent
      opacity={isHighlighted ? material.opacity * 1.3 : material.opacity}
    />
  )
}

// Background environment with animated elements
const NetworkEnvironment = ({ theme = "tokyo" }) => {
  return (
    <>
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Grid floor */}
      <group position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry args={[400, 400, 100, 100]} />
          <meshBasicMaterial color="#000000" wireframe transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />

      {/* Directional lights for the neon effect */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ff00ff" />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} color="#00ffff" />
      <directionalLight position={[0, -10, 5]} intensity={0.3} color="#b19fff" />

      {/* Point lights for dramatic effect */}
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#ffffff" />
      <pointLight position={[30, 0, 0]} intensity={0.5} color="#ff00ff" />
      <pointLight position={[-30, 0, 0]} intensity={0.5} color="#00ffff" />
      <pointLight position={[0, 0, 30]} intensity={0.5} color="#b19fff" />

      {/* Environment for better lighting */}
      <Environment preset="night" />
    </>
  )
}

// Camera controller with smooth transitions
const CameraController = ({ target, resetView, isExploring }) => {
  const { camera } = useThree()
  const controlsRef = useRef()

  // Handle camera transitions
  useEffect(() => {
    if (target) {
      const targetPosition = new THREE.Vector3(...target)
      const startPosition = camera.position.clone()
      const startRotation = camera.rotation.clone()

      // Calculate a good viewing position
      const viewPosition = targetPosition.clone().add(new THREE.Vector3(10, 5, 10))

      // Animate camera movement
      const duration = 1.5
      const startTime = Date.now()

      const animateCamera = () => {
        const elapsed = (Date.now() - startTime) / 1000
        const progress = Math.min(elapsed / duration, 1)

        // Ease function
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        // Interpolate position
        camera.position.lerpVectors(startPosition, viewPosition, easeProgress)

        // Look at target
        camera.lookAt(targetPosition)

        if (progress < 1) {
          requestAnimationFrame(animateCamera)
        } else if (controlsRef.current) {
          // Update controls target after animation
          controlsRef.current.target.copy(targetPosition)
        }
      }

      animateCamera()
    }
  }, [target, camera])

  // Handle reset view
  useEffect(() => {
    if (resetView) {
      const duration = 1.5
      const startTime = Date.now()
      const startPosition = camera.position.clone()
      const targetPosition = new THREE.Vector3(0, 20, 40)

      const animateReset = () => {
        const elapsed = (Date.now() - startTime) / 1000
        const progress = Math.min(elapsed / duration, 1)

        // Ease function
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        // Interpolate position
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress)

        // Look at origin
        camera.lookAt(0, 0, 0)

        if (progress < 1) {
          requestAnimationFrame(animateReset)
        } else if (controlsRef.current) {
          // Update controls target after animation
          controlsRef.current.target.set(0, 0, 0)
        }
      }

      animateReset()
    }
  }, [resetView, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={!isExploring}
      minDistance={5}
      maxDistance={100}
      dampingFactor={0.1}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
    />
  )
}

// Main 3D scene component
const NetworkScene = ({ networkData, selectedNode, setSelectedNode, searchTerm, filterStatus }) => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [hoveredNode, setHoveredNode] = useState(null)
  const [cameraTarget, setCameraTarget] = useState(null)
  const [resetView, setResetView] = useState(false)
  const [isExploring, setIsExploring] = useState(false)

  // Process network data into 3D nodes and connections
  useEffect(() => {
    if (!networkData || !networkData.id) return

    const processedNodes = []
    const processedConnections = []

    // Process root node
    const rootNode = {
      ...networkData,
      position: [0, 0, 0],
      isRoot: true,
    }
    processedNodes.push(rootNode)

    // Process child nodes by level
    if (networkData.children) {
      Object.entries(networkData.children).forEach(([level, levelNodes]) => {
        if (Array.isArray(levelNodes)) {
          const levelNum = Number.parseInt(level)
          const nodesAtLevel = levelNodes.length
          const radius = 10 + levelNum * 8

          levelNodes.forEach((node, index) => {
            if (!node || !node.id) return

            // Calculate position in a circle at this level
            const angle = (index / nodesAtLevel) * Math.PI * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = levelNum * 2 // Slight vertical separation between levels

            const processedNode = {
              ...node,
              position: [x, y, z],
              isRoot: false,
              level: levelNum,
            }

            processedNodes.push(processedNode)

            // Create connection to sponsor
            if (node.sponsorId) {
              const sourceNode = processedNodes.find((n) => n.id === node.sponsorId)
              if (sourceNode) {
                processedConnections.push({
                  id: `${node.sponsorId}-${node.id}`,
                  source: sourceNode.position,
                  target: [x, y, z],
                  status: node.status,
                })
              }
            }
          })
        }
      })
    }

    // Apply filters if needed
    let filteredNodes = processedNodes
    let filteredConnections = processedConnections

    if (filterStatus && filterStatus !== "ALL") {
      filteredNodes = processedNodes.filter((node) => node.status === filterStatus || node.isRoot)

      // Only keep connections between visible nodes
      const visibleNodeIds = filteredNodes.map((node) => node.id)
      filteredConnections = processedConnections.filter((conn) => {
        const sourceNode = processedNodes.find((n) => n.position === conn.source)
        const targetNode = processedNodes.find((n) => n.position === conn.target)
        return (
          sourceNode && targetNode && visibleNodeIds.includes(sourceNode.id) && visibleNodeIds.includes(targetNode.id)
        )
      })
    }

    setNodes(filteredNodes)
    setConnections(filteredConnections)
  }, [networkData, filterStatus])

  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedNode(node)
    setCameraTarget(node.position)
    setResetView(false)
  }

  // Handle reset view
  const handleResetView = () => {
    setSelectedNode(null)
    setResetView(true)
    setCameraTarget(null)
  }

  // Check if a node matches the search term
  const nodeMatchesSearch = (node) => {
    if (!searchTerm) return false

    const searchLower = searchTerm.toLowerCase()
    const firstName = (node.user?.firstName || "").toLowerCase()
    const lastName = (node.user?.lastName || "").toLowerCase()
    const fullName = `${firstName} ${lastName}`
    const packageName = (node.package?.name || "").toLowerCase()

    return fullName.includes(searchLower) || packageName.includes(searchLower)
  }

  return (
    <>
      {/* Environment and lighting */}
      <NetworkEnvironment />

      {/* Camera controller */}
      <CameraController target={cameraTarget} resetView={resetView} isExploring={isExploring} />

      {/* Connections */}
      {connections.map((connection) => (
        <Connection
          key={connection.id}
          start={connection.source}
          end={connection.target}
          status={connection.status}
          isHighlighted={
            selectedNode && (connection.source === selectedNode.position || connection.target === selectedNode.position)
          }
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          position={node.position}
          onClick={handleNodeClick}
          isSelected={selectedNode && selectedNode.id === node.id}
          isHovered={hoveredNode && hoveredNode.id === node.id}
          searchMatch={nodeMatchesSearch(node)}
        />
      ))}
    </>
  )
}

// Main component
const NetworkTree = ({ networkData }) => {
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [viewMode, setViewMode] = useState("3D")
  const [effectsIntensity, setEffectsIntensity] = useState(0.8)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)



  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])



  return (
    <div
      ref={containerRef}
      className={`relative ${isFullscreen ? "w-screen h-screen" : "w-full h-[700px]"} bg-[#050510] rounded-lg overflow-hidden`}
    >
      {/* Main 3D canvas */}
      <Canvas shadows camera={{ position: [0, 20, 40], fov: 60 }}>
        <Suspense fallback={null}>
          <NetworkScene
            networkData={networkData}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
          />
        </Suspense>
      </Canvas>

     

      {/* Node details panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <Card className="bg-black/70 backdrop-blur-lg border-[#ff00ff]/30 text-white overflow-hidden">
              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="flex justify-between items-center p-4 border-b border-[#ff00ff]/20">
                    <div>
                      <h3 className="font-bold text-xl text-[#ff00ff] flex items-center gap-2">
                        {selectedNode.status === "ROOT" && <Badge className="bg-[#ff00ff] text-white">You</Badge>}
                        {selectedNode.user?.firstName} {selectedNode.user?.lastName}
                      </h3>
                      <p className="text-sm text-[#b19fff]">
                        Level {selectedNode.level} • Position {selectedNode.position}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <TabsList className="bg-black/30 border border-[#b19fff]/20">
                        <TabsTrigger
                          value="overview"
                          className="data-[state=active]:bg-[#ff00ff]/20 data-[state=active]:text-[#ff00ff]"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="details"
                          className="data-[state=active]:bg-[#ff00ff]/20 data-[state=active]:text-[#ff00ff]"
                        >
                          Details
                        </TabsTrigger>
                        <TabsTrigger
                          value="actions"
                          className="data-[state=active]:bg-[#ff00ff]/20 data-[state=active]:text-[#ff00ff]"
                        >
                          Actions
                        </TabsTrigger>
                      </TabsList>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedNode(null)}
                        className="text-[#b19fff] hover:text-white hover:bg-[#ff00ff]/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="overview" className="p-4 mt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                        <div className="text-[#b19fff] flex items-center gap-2 mb-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          Package
                        </div>
                        <div className="font-medium text-white text-lg">
                          {selectedNode.package?.name || "No Package"}
                        </div>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                        <div className="text-[#b19fff] flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-[#00ffff]" />
                          Direct Referrals
                        </div>
                        <div className="font-medium text-white text-lg">{selectedNode.directCount || 0}</div>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                        <div className="text-[#b19fff] flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-[#ff00ff]" />
                          Status
                        </div>
                        <div className="font-medium text-white text-lg flex items-center">
                          <span
                            className={`mr-2 inline-block w-2 h-2 rounded-full ${
                              selectedNode.status === "ACTIVE"
                                ? "bg-[#00ffff]"
                                : selectedNode.status === "ROOT"
                                  ? "bg-[#ff00ff]"
                                  : "bg-[#b19fff]"
                            }`}
                          ></span>
                          {selectedNode.status}
                        </div>
                      </div>
                    </div>

                    {/* Network path visualization */}
                    <div className="mt-4 bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                      <h4 className="text-[#b19fff] mb-2">Network Path</h4>
                      <div className="flex items-center justify-center">
                        {networkData && selectedNode.level > 0 && (
                          <div className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-[#ff00ff]/20 border-2 border-[#ff00ff] flex items-center justify-center">
                                <User className="w-5 h-5 text-[#ff00ff]" />
                              </div>
                              <span className="text-xs mt-1 text-[#ff00ff]">Root</span>
                            </div>

                            {/* Path connections */}
                            {Array.from({ length: selectedNode.level }).map((_, i) => (
                              <div key={i} className="flex items-center">
                                <div className="w-10 h-0.5 bg-gradient-to-r from-[#ff00ff] to-[#00ffff]"></div>
                                <div className="w-10 h-10 rounded-full bg-[#00ffff]/20 border-2 border-[#00ffff] flex items-center justify-center">
                                  <User className="w-5 h-5 text-[#00ffff]" />
                                </div>
                                <span className="text-xs mt-1 absolute -bottom-5 text-[#00ffff]">L{i + 1}</span>
                              </div>
                            ))}

                            <div className="w-10 h-0.5 bg-gradient-to-r from-[#00ffff] to-[#b19fff]"></div>
                            <div className="w-10 h-10 rounded-full bg-[#b19fff]/20 border-2 border-[#b19fff] flex items-center justify-center">
                              <User className="w-5 h-5 text-[#b19fff]" />
                            </div>
                            <span className="text-xs mt-1 text-[#b19fff]">Current</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="p-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                          <h4 className="text-[#b19fff] mb-2">Personal Info</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Name:</span>
                              <span className="text-white">
                                {selectedNode.user?.firstName} {selectedNode.user?.lastName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Email:</span>
                              <span className="text-white">{selectedNode.user?.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Joined:</span>
                              <span className="text-white">{selectedNode.user?.joinDate || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                          <h4 className="text-[#b19fff] mb-2">Package Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Package:</span>
                              <span className="text-white">{selectedNode.package?.name || "No Package"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Price:</span>
                              <span className="text-white">${selectedNode.package?.price || "0"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Status:</span>
                              <span
                                className={`${selectedNode.status === "ACTIVE" ? "text-[#00ffff]" : "text-[#b19fff]"}`}
                              >
                                {selectedNode.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                          <h4 className="text-[#b19fff] mb-2">Network Info</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Level:</span>
                              <span className="text-white">{selectedNode.level}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Position:</span>
                              <span className="text-white">{selectedNode.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#b19fff]">Direct Referrals:</span>
                              <span className="text-white">{selectedNode.directCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-md border border-[#b19fff]/20">
                          <h4 className="text-[#b19fff] mb-2">Performance</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-[#b19fff]">Activity</span>
                                <span className="text-xs text-white">75%</span>
                              </div>
                              <div className="w-full bg-black/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-[#ff00ff] to-[#00ffff] h-2 rounded-full"
                                  style={{ width: "75%" }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-[#b19fff]">Growth</span>
                                <span className="text-xs text-white">45%</span>
                              </div>
                              <div className="w-full bg-black/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-[#ff00ff] to-[#00ffff] h-2 rounded-full"
                                  style={{ width: "45%" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="p-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="bg-[#00ffff] hover:bg-[#00ffff]/80 text-black">Contact Member</Button>
                      <Button className="bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-white">View Full Profile</Button>
                      <Button className="bg-[#b19fff] hover:bg-[#b19fff]/80 text-black">Send Message</Button>
                      <Button variant="outline" className="border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff]/20">
                        View Transactions
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md p-3 rounded-md border border-[#b19fff]/30 text-white">
        <div className="text-xs font-bold text-[#b19fff] mb-2">Network Legend</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#ff00ff]"></div>
            <span>You (Root)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#00ffff]"></div>
            <span>Active Member</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#b19fff]"></div>
            <span>Inactive Member</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-[#00ffff]/30 text-white">
        <div className="text-xs flex items-center gap-3">
          <span>
            <span className="text-[#00ffff]">Drag</span> to rotate
          </span>
          <span className="w-1 h-1 rounded-full bg-[#b19fff]"></span>
          <span>
            <span className="text-[#00ffff]">Scroll</span> to zoom
          </span>
          <span className="w-1 h-1 rounded-full bg-[#b19fff]"></span>
          <span>
            <span className="text-[#00ffff]">Click</span> on node for details
          </span>
        </div>
      </div>
    </div>
  )
}

export default NetworkTree
