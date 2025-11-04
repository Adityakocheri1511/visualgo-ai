import React, { useState, useRef, useEffect } from "react";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Divider,
  Paper,
  Slider,
  Select,
  Collapse,
  ActionIcon,
  Badge,
  Progress,
  Tabs,
  Alert,
  Modal,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconNetwork,
  IconRoute,
  IconBrain,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconTrash,
  IconPlayerPlay,
  IconRefresh,
  IconInfoCircle,
  IconChartBar,
  IconCode,
  IconLink,
  IconSettings,
} from "@tabler/icons-react";
import explainAlgorithm from "../ai/explainGemini";
import AlgorithmExplanation from "../components/AlgorithmExplanation";

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [speed, setSpeed] = useState(500);
  const [aiExplanation, setAiExplanation] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [path, setPath] = useState([]);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ nodesVisited: 0, edgesExplored: 0 });
  const [activeTab, setActiveTab] = useState("visualizer");
  const [showCode, setShowCode] = useState(false);
  const canvasRef = useRef(null);

  const [controlsOpen, setControlsOpen] = useState(true);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");

  useEffect(() => {
    setControlsOpen(!isMobile);
  }, [isMobile]);

  const generateSampleGraph = () => {
    const sampleNodes = [
      { id: 1, x: isMobile ? 100 : 150, y: isMobile ? 100 : 150, label: "A" },
      { id: 2, x: isMobile ? 250 : 400, y: isMobile ? 80 : 100, label: "B" },
      { id: 3, x: isMobile ? 300 : 550, y: isMobile ? 180 : 200, label: "C" },
      { id: 4, x: isMobile ? 150 : 250, y: isMobile ? 250 : 300, label: "D" },
      { id: 5, x: isMobile ? 280 : 450, y: isMobile ? 280 : 350, label: "E" },
    ];

    const sampleEdges = [
      { from: 1, to: 2, weight: 4 },
      { from: 1, to: 4, weight: 2 },
      { from: 2, to: 3, weight: 3 },
      { from: 2, to: 4, weight: 1 },
      { from: 2, to: 5, weight: 5 },
      { from: 3, to: 5, weight: 2 },
      { from: 4, to: 5, weight: 3 },
    ];

    setNodes(sampleNodes);
    setEdges(sampleEdges);
  };

  const handleCanvasClick = (e) => {
    if (isAnimating) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
    
    for (const node of nodes) {
      const nodeRadius = isMobile ? 25 : 30;
      if (Math.hypot(node.x - x, node.y - y) < nodeRadius + 10) return;
    }
    
    const label = String.fromCharCode(65 + (id - 1));
    setNodes([...nodes, { id, x, y, label }]);
    showMessage(`Added node ${label}`, "success");
  };

  const handleNodeClick = (node) => {
    if (isAnimating) return;
    
    if (!selectedNode) {
      setSelectedNode(node);
      showMessage(`Selected node ${node.label}`, "info");
    } else if (selectedNode.id !== node.id) {
      const weight = Math.floor(Math.random() * 9) + 1;
      setEdges([...edges, { from: selectedNode.id, to: node.id, weight }]);
      showMessage(`Created edge ${selectedNode.label} → ${node.label} (weight: ${weight})`, "success");
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
      showMessage(`Deselected node ${node.label}`, "info");
    }
  };

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setVisitedNodes([]);
    setCurrentNode(null);
    setPath([]);
    setStats({ nodesVisited: 0, edgesExplored: 0 });
    showMessage("Graph cleared", "info");
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const showMessage = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(""), 3000);
  };

  const bfs = async () => {
    if (nodes.length === 0) {
      showMessage("Add nodes first!", "error");
      return;
    }

    setIsAnimating(true);
    setVisitedNodes([]);
    setPath([]);
    showMessage("Running BFS...", "info");

    const start = nodes[0].id;
    const visited = new Set([start]);
    const queue = [start];
    const adj = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((e) => {
      adj.get(e.from).push(e.to);
      adj.get(e.to).push(e.from);
    });

    let nodesVisited = 0;
    let edgesExplored = 0;

    while (queue.length > 0) {
      const current = queue.shift();
      setCurrentNode(current);
      setVisitedNodes([...visited]);
      nodesVisited++;
      setStats({ nodesVisited, edgesExplored });
      await sleep(speed);

      for (const neighbor of adj.get(current) || []) {
        edgesExplored++;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    setCurrentNode(null);
    setIsAnimating(false);
    showMessage("BFS completed!", "success");
  };

  const dfs = async () => {
    if (nodes.length === 0) {
      showMessage("Add nodes first!", "error");
      return;
    }

    setIsAnimating(true);
    setVisitedNodes([]);
    setPath([]);
    showMessage("Running DFS...", "info");

    const start = nodes[0].id;
    const visited = new Set();
    const adj = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((e) => {
      adj.get(e.from).push(e.to);
      adj.get(e.to).push(e.from);
    });

    let nodesVisited = 0;
    let edgesExplored = 0;

    const dfsRecursive = async (nodeId) => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      setCurrentNode(nodeId);
      setVisitedNodes([...visited]);
      nodesVisited++;
      setStats({ nodesVisited, edgesExplored });
      await sleep(speed);

      for (const neighbor of adj.get(nodeId) || []) {
        edgesExplored++;
        await dfsRecursive(neighbor);
      }
    };

    await dfsRecursive(start);
    setCurrentNode(null);
    setIsAnimating(false);
    showMessage("DFS completed!", "success");
  };

  const dijkstra = async () => {
    if (nodes.length < 2) {
      showMessage("Add at least 2 nodes!", "error");
      return;
    }

    setIsAnimating(true);
    setVisitedNodes([]);
    setPath([]);
    showMessage("Running Dijkstra...", "info");

    const start = nodes[0].id;
    const end = nodes[nodes.length - 1].id;
    const distances = {};
    const parent = {};
    const visited = new Set();
    const pq = [];

    nodes.forEach((node) => {
      distances[node.id] = Infinity;
    });
    distances[start] = 0;
    pq.push({ node: start, distance: 0 });

    let nodesVisited = 0;
    let edgesExplored = 0;

    while (pq.length > 0) {
      pq.sort((a, b) => a.distance - b.distance);
      const { node: current } = pq.shift();

      if (visited.has(current)) continue;
      visited.add(current);

      setCurrentNode(current);
      setVisitedNodes([...visited]);
      nodesVisited++;
      setStats({ nodesVisited, edgesExplored });
      await sleep(speed);

      if (current === end) {
        const pathArray = [];
        let node = end;
        while (node !== undefined) {
          pathArray.unshift(node);
          node = parent[node];
        }
        setPath(pathArray);
        showMessage(`Path found! Distance: ${distances[end]}`, "success");
        setIsAnimating(false);
        return;
      }

      const neighbors = edges.filter(
        (e) => e.from === current || e.to === current
      );

      for (const edge of neighbors) {
        edgesExplored++;
        const neighbor = edge.from === current ? edge.to : edge.from;
        const newDistance = distances[current] + edge.weight;

        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          parent[neighbor] = current;
          pq.push({ node: neighbor, distance: newDistance });
        }
      }
    }

    setCurrentNode(null);
    setIsAnimating(false);
    showMessage("Dijkstra completed!", "success");
  };

  const handleRun = async () => {
    if (algorithm === "bfs") await bfs();
    if (algorithm === "dfs") await dfs();
    if (algorithm === "dijkstra") await dijkstra();
  };

  const handleAIExplain = async () => {
    setIsLoadingAI(true);
    setShowExplanation(true);
    try {
      const explanation = await explainAlgorithm(algorithm);
      setAiExplanation(explanation);
    } catch {
      setAiExplanation("⚠️ Error generating AI explanation.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getNodeColor = (nodeId) => {
    if (currentNode === nodeId) return "#f59e0b";
    if (path.includes(nodeId)) return "#10b981";
    if (visitedNodes.includes(nodeId)) return "#6366f1";
    if (selectedNode?.id === nodeId) return "#3b82f6";
    return "#a7f3d0";
  };

  const getNodeSize = () => {
    if (isSmallMobile) return 32;
    if (isMobile) return 36;
    if (isTablet) return 40;
    return 44;
  };

  const canvasHeight = isSmallMobile ? "50vh" : isMobile ? "55vh" : isTablet ? "60vh" : "500px";
  
  // --- Helper for shimmer dots ---
const dot = (color, delay) => ({
  width: 10,
  height: 10,
  background: color,
  borderRadius: "50%",
  animation: `bounce 1s infinite ${delay}`,
});

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #d1fae5 100%)",
        padding: isSmallMobile ? "1rem 0.5rem" : isMobile ? "1.5rem 1rem" : isTablet ? "2rem" : "3rem 2rem",
      }}
    >
      <Stack
        spacing={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
        style={{ maxWidth: isTablet ? "100%" : 1400, margin: "0 auto" }}
      >
        {/* Header */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  style={{ textAlign: "center" }}
>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))",
      padding: isMobile ? "1rem" : "1.5rem",
      borderRadius: 20,
      marginBottom: "1.5rem",
    }}
  >
    <IconNetwork size={isMobile ? 48 : 64} color="#10b981" stroke={2} />
  </div>

  <Title
    order={1}
    mb="sm"
    style={{
      fontSize: isMobile ? "1.8rem" : "2.4rem",
      background: "linear-gradient(90deg, #059669, #10b981)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Graph Algorithm Visualizer
  </Title>

  <Text
    size={isMobile ? "sm" : "lg"}
    color="dimmed"
    style={{
      paddingInline: isMobile ? "0.5rem" : 0,
      lineHeight: 1.5,
    }}
  >
    Interactive visualization for graph traversal and pathfinding algorithms
  </Text>
</motion.div>

        {/* Message Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              <Alert
                icon={<IconInfoCircle size={16} />}
                title={message.type === "success" ? "Success" : message.type === "error" ? "Error" : "Info"}
                color={message.type === "success" ? "green" : message.type === "error" ? "red" : "blue"}
                radius="md"
              >
                {message.text}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab} color="green">
        <Tabs.List>
  <Tabs.Tab
    value="visualizer"
    icon={<IconLink size={16} />}
    style={{
      fontSize: "inherit",
      visibility: "visible",
      paddingInline: isMobile ? "0.75rem" : "1.25rem",
    }}
  >
    Visualizer
  </Tabs.Tab>

  <Tabs.Tab
    value="stats"
    icon={<IconChartBar size={16} />}
    style={{
      fontSize: "inherit",
      visibility: "visible",
      paddingInline: isMobile ? "0.75rem" : "1.25rem",
    }}
  >
    Stats
  </Tabs.Tab>
</Tabs.List>

          <Tabs.Panel value="visualizer" pt={isMobile ? "md" : "xl"}>
            {/* Control Panel */}
            <Card
              shadow="md"
              padding={isSmallMobile ? "sm" : isMobile ? "md" : "lg"}
              radius="lg"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(209,250,229,0.5)",
                marginBottom: "1rem",
              }}
            >
              <Group position="apart" mb={isSmallMobile ? "xs" : "sm"}>
                <Text size={isSmallMobile ? "sm" : "md"} weight={700} color="#064e3b">
                  Controls
                </Text>
                {(isMobile || isSmallMobile) && (
                  <ActionIcon
                    onClick={() => setControlsOpen((o) => !o)}
                    size="lg"
                    variant="light"
                    color="green"
                  >
                    {controlsOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                  </ActionIcon>
                )}
              </Group>

              <Collapse in={controlsOpen}>
                <Stack spacing={isSmallMobile ? "xs" : "sm"}>
                  <Group grow={!isMobile} spacing={isSmallMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <Select
                      label="Algorithm"
                      value={algorithm}
                      onChange={setAlgorithm}
                      disabled={isAnimating}
                      data={[
                        { value: "bfs", label: "BFS" },
                        { value: "dfs", label: "DFS" },
                        { value: "dijkstra", label: "Dijkstra" },
                      ]}
                      size={isSmallMobile ? "xs" : "sm"}
                      radius="md"
                      style={{ flex: isMobile ? "1 1 100%" : "1 1 200px" }}
                    />

                    <div style={{ flex: isMobile ? "1 1 100%" : "1 1 200px" }}>
                      <Text size={isSmallMobile ? "xs" : "sm"} weight={500} mb={4} color="dimmed">
                        Speed: {speed}ms
                      </Text>
                      <Slider
                        min={100}
                        max={1000}
                        step={100}
                        value={speed}
                        onChange={setSpeed}
                        disabled={isAnimating}
                        color="teal"
                        size={isSmallMobile ? "xs" : "sm"}
                      />
                    </div>
                  </Group>

                  <Group grow spacing={isSmallMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <Button
                      color="teal"
                      leftSection={<IconPlayerPlay size={isSmallMobile ? 14 : 16} />}
                      onClick={handleRun}
                      disabled={isAnimating || nodes.length === 0}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      {isSmallMobile ? "Run" : "Run Algorithm"}
                    </Button>

                    <Button
                      color="green"
                      variant="light"
                      leftSection={<IconRefresh size={isSmallMobile ? 14 : 16} />}
                      onClick={generateSampleGraph}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      Sample
                    </Button>

                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconTrash size={isSmallMobile ? 14 : 16} />}
                      onClick={resetGraph}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      Clear
                    </Button>

                    {!isSmallMobile && (
                      <Button
                        variant="gradient"
                        gradient={{ from: "teal", to: "green" }}
                        leftSection={<IconBrain size={16} />}
                        onClick={handleAIExplain}
                        disabled={isAnimating}
                        size={isMobile ? "sm" : "md"}
                        radius="md"
                        fullWidth={isMobile}
                      >
                        AI Explain
                      </Button>
                    )}
                  </Group>

                  {isSmallMobile && (
                    <Button
                      variant="gradient"
                      gradient={{ from: "teal", to: "green" }}
                      leftSection={<IconBrain size={14} />}
                      onClick={handleAIExplain}
                      disabled={isAnimating}
                      size="xs"
                      radius="md"
                      fullWidth
                    >
                      AI Explain
                    </Button>
                  )}
                </Stack>
              </Collapse>
            </Card>

            {/* Canvas */}
            <Card
              shadow="lg"
              radius="lg"
              style={{
                position: "relative",
                height: canvasHeight,
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(209,250,229,0.4)",
                overflow: "hidden",
                cursor: isAnimating ? "not-allowed" : "crosshair",
                touchAction: "none",
              }}
              onClick={handleCanvasClick}
              ref={canvasRef}
            >
              {nodes.length === 0 ? (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#047857",
    }}
  >
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.15))",
        padding: isMobile ? "1rem" : "1.25rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(16,185,129,0.15)",
        marginBottom: "1rem",
      }}
    >
      <IconNetwork
        size={isMobile ? 42 : 56}
        color="#10b981"
        stroke={2}
      />
    </div>

    <Title
      order={3}
      style={{
        color: "#047857",
        fontSize: isMobile ? "1.2rem" : "1.5rem",
        marginBottom: "0.3rem",
      }}
    >
      No Graph Yet
    </Title>

    <Text
      size={isMobile ? "xs" : "sm"}
      color="dimmed"
      style={{
        maxWidth: "240px",
        textAlign: "center",
        lineHeight: 1.4,
      }}
    >
      Click anywhere to add nodes and start building your graph.
    </Text>
  </motion.div>
) : (
  <>
                  <svg
                    width="100%"
                    height="100%"
                    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                  >
                    {edges.map((edge, i) => {
                      const from = nodes.find((n) => n.id === edge.from);
                      const to = nodes.find((n) => n.id === edge.to);
                      if (!from || !to) return null;

                      const isInPath = path.includes(from.id) && path.includes(to.id);
                      const isExplored = visitedNodes.includes(from.id) && visitedNodes.includes(to.id);

                      return (
                        <g key={i}>
                          <line
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={isInPath ? "#10b981" : isExplored ? "#6366f1" : "#9ca3af"}
                            strokeWidth={isInPath ? 4 : isExplored ? 3 : 2}
                            markerEnd="url(#arrowhead)"
                            style={{ transition: "all 0.3s ease" }}
                          />
                          {!isSmallMobile && (
                            <text
                              x={(from.x + to.x) / 2}
                              y={(from.y + to.y) / 2}
                              fill="#059669"
                              fontSize={isMobile ? "10" : "12"}
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {edge.weight}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="8"
                        markerHeight="6"
                        refX="8"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
                      </marker>
                    </defs>
                  </svg>

                  {nodes.map((node) => {
                    const nodeSize = getNodeSize();
                    return (
                      <motion.div
                        key={node.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeClick(node);
                        }}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: isAnimating ? 1 : 1.1 }}
                        whileTap={{ scale: isAnimating ? 1 : 0.95 }}
                        style={{
                          position: "absolute",
                          top: node.y - nodeSize / 2,
                          left: node.x - nodeSize / 2,
                          width: nodeSize,
                          height: nodeSize,
                          borderRadius: "50%",
                          background: getNodeColor(node.id),
                          color: "#064e3b",
                          fontWeight: 700,
                          fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.85rem" : "1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: currentNode === node.id
                            ? "0 0 20px rgba(245,158,11,0.6)"
                            : "0 4px 12px rgba(16,185,129,0.3)",
                          cursor: isAnimating ? "not-allowed" : "pointer",
                          border: `${isMobile ? 2 : 3}px solid ${
                            selectedNode?.id === node.id ? "#3b82f6" : "rgba(5,150,105,0.5)"
                          }`,
                          transition: "all 0.3s ease",
                          pointerEvents: "auto",
                          userSelect: "none",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {node.label}
                      </motion.div>
                    );
                  })}
                </>
              )}
            </Card>

            {/* Legend */}
            {!isSmallMobile && nodes.length > 0 && (
              <Group position="center" spacing={isMobile ? "xs" : "md"} mt="md">
                {[
                  { color: "#a7f3d0", label: "Unvisited" },
                  { color: "#6366f1", label: "Visited" },
                  { color: "#f59e0b", label: "Current" },
                  { color: "#10b981", label: "Path" },
                ].map((item, i) => (
                  <Group key={i} spacing={4}>
                    <div
                      style={{
                        width: isMobile ? 12 : 16,
                        height: isMobile ? 12 : 16,
                        borderRadius: "50%",
                        background: item.color,
                        border: "2px solid rgba(5,150,105,0.5)",
                      }}
                    />
                    <Text size={isMobile ? "xs" : "sm"} weight={500} color="dimmed">
                      {item.label}
                    </Text>
                  </Group>
                ))}
              </Group>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="stats" pt={isMobile ? "md" : "xl"}>
  <Stack spacing={isMobile ? "sm" : "md"}>
    {/* Stats Cards */}
    <Group
      grow
      spacing={isMobile ? "xs" : "md"}
      style={{ flexDirection: isMobile ? "column" : "row" }}
    >
      {[
        { color: "green", icon: IconNetwork, title: stats.nodesVisited, text: "Nodes Visited" },
        { color: "teal", icon: IconRoute, title: stats.edgesExplored, text: "Edges Explored" },
        { color: "cyan", icon: IconChartBar, title: nodes.length, text: "Total Nodes" },
      ].map((s, i) => (
        <Card
          key={i}
          shadow="sm"
          padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
          radius="lg"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(209,250,229,0.4)",
          }}
        >
          <Stack align="center" spacing={isSmallMobile ? "xs" : "sm"}>
            <s.icon size={isSmallMobile ? 32 : isMobile ? 40 : 48} color={s.color} />
            <Title
              order={2}
              color={s.color}
              style={{
                fontSize: isSmallMobile ? "1.25rem" : isMobile ? "1.5rem" : "1.75rem",
                lineHeight: 1.2,
              }}
            >
              {s.title}
            </Title>
            <Text
              size={isSmallMobile ? "xs" : "sm"}
              weight={500}
              color="dimmed"
              align="center"
            >
              {s.text}
            </Text>
          </Stack>
        </Card>
      ))}
    </Group>

    {/* ✅ Time & Space Complexity Card */}
    <Card
      shadow="sm"
      padding={isMobile ? "md" : isMobile ? "lg" : "xl"}
      radius="lg"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(186,230,253,0.6)",
      }}
    >
      <Text size={isMobile ? "sm" : "md"} weight={700} mb="md" color="#075985">
        TIME COMPLEXITY
      </Text>
      <Stack spacing={isMobile ? "xs" : "sm"}>
        <Group position="apart">
          <Text size={isMobile ? "xs" : "sm"} color="dimmed">
            Best Case:
          </Text>
          <Badge color="green" variant="light" size={isMobile ? "sm" : "md"}>
            O(V + E)
          </Badge>
        </Group>
        <Group position="apart">
          <Text size={isMobile ? "xs" : "sm"} color="dimmed">
            Average Case:
          </Text>
          <Badge color="yellow" variant="light" size={isMobile ? "sm" : "md"}>
            O(V + E)
          </Badge>
        </Group>
        <Group position="apart">
          <Text size={isMobile ? "xs" : "sm"} color="dimmed">
            Worst Case:
          </Text>
          <Badge color="red" variant="light" size={isMobile ? "sm" : "md"}>
            O(V + E)
          </Badge>
        </Group>
      </Stack>

      <Divider my={isMobile ? "sm" : "md"} />

      <Text size={isMobile ? "sm" : "md"} weight={700} mb="md" color="#075985">
        SPACE COMPLEXITY
      </Text>
      <Group position="apart">
        <Text size={isMobile ? "xs" : "sm"} color="dimmed">
          Auxiliary Space:
        </Text>
        <Badge color="blue" variant="filled" size={isMobile ? "sm" : "md"}>
          O(V)
        </Badge>
      </Group>
    </Card>
  </Stack>
</Tabs.Panel>
</Tabs>

                          {/* --- AI Explanation Card --- */}
                          {(showExplanation || aiExplanation) && (
                            <Card
                              shadow="lg"
                              radius="lg"
                              p={isSmallMobile ? "md" : "xl"}
                              style={{
                                background: "rgba(255,255,255,0.8)",
                                border: "1px solid rgba(230,230,255,0.6)",
                                backdropFilter: "blur(10px)",
                                textAlign: "center",
                              }}
                            >
                              {isLoadingAI ? (
                                <>
                                  <Title
                                    order={3}
                                    mb="sm"
                                    style={{
                                      color: "#1e3a8a",
                                      fontWeight: 700,
                                      textAlign: "center",
                                    }}
                                  >
                                    Generating AI Explanation
                                  </Title>
                                  <Text
                                    color="#475569"
                                    mb="lg"
                                    style={{
                                      fontSize: isMobile ? "0.9rem" : "1rem",
                                      textAlign: "center",
                                    }}
                                  >
                                    Analyzing {algorithm.toUpperCase()} algorithm...
                                  </Text>
                                  {/* Animated Triple Dots */}
                                    <Group
                                      position="center"
                                      align="center"
                                      mt="md"
                                      spacing={12}
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                    <div style={dot("#10b981", "0s")} />
                                    <div style={dot("#10b981", "0.2s")} />
                                    <div style={dot("#10b981", "0.4s")} />
                                  </Group>
                                  <style>{`
                                    @keyframes bounce {
                                      0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
                                      40% { transform: scale(1.3); opacity: 1; }
                                    }
                                  `}</style>
                                </>
                              ) : (
                                <AlgorithmExplanation content={aiExplanation} />
                              )}
                            </Card>
                          )}
                  
                          {/* --- Code Modal --- */}
                          <Modal
                            opened={showCode}
                            onClose={() => setShowCode(false)}
                            title={
                              <Group spacing="xs">
                                <IconCode size={18} color="#059669" />
                                <Text weight={600} color="#064e3b">
                                  {algorithm.toUpperCase()} Algorithm Code
                                </Text>
                              </Group>
                            }
                            centered
                            size={isSmallMobile ? "xs" : isMobile ? "lg" : "xl"}
                            overlayProps={{ blur: 2, opacity: 0.4 }}
                          >
                            <Text
                              size="sm"
                              color="dimmed"
                              mb="sm"
                              style={{ fontFamily: "monospace", lineHeight: 1.6 }}
                            >
                              {/* Placeholder code example */}
                              {algorithm === "bfs" &&
                                `function bfs(graph, start) {
                    const visited = new Set();
                    const queue = [start];
                    while (queue.length) {
                      const node = queue.shift();
                      if (!visited.has(node)) {
                        visited.add(node);
                        console.log(node);
                        for (const neighbor of graph[node] || []) queue.push(neighbor);
                      }
                    }
                  }`}
                              {algorithm === "dfs" &&
                                `function dfs(graph, node, visited = new Set()) {
                    if (visited.has(node)) return;
                    visited.add(node);
                    console.log(node);
                    for (const neighbor of graph[node] || []) dfs(graph, neighbor, visited);
                  }`}
                              {algorithm === "dijkstra" &&
                                `function dijkstra(graph, start) {
                    const dist = {};
                    const visited = new Set();
                    for (const node in graph) dist[node] = Infinity;
                    dist[start] = 0;
                    while (visited.size < Object.keys(graph).length) {
                      const curr = Object.keys(dist)
                        .filter(n => !visited.has(n))
                        .reduce((a, b) => (dist[a] < dist[b] ? a : b));
                      visited.add(curr);
                      for (const [n, w] of Object.entries(graph[curr])) {
                        const d = dist[curr] + w;
                        if (d < dist[n]) dist[n] = d;
                      }
                    }
                    return dist;
                  }`}
                            </Text>
                          </Modal>
                        </Stack>
                      </div>
                    );
                  }