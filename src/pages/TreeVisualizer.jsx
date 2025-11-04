import React, { useState, useRef, useEffect } from "react";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Select,
  Collapse,
  ActionIcon,
  Tabs,
  Paper,
  Badge,
  Modal,
  Tooltip,
  Alert,
  NumberInput,
  Progress,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconGitBranch,
  IconPlus,
  IconMinus,
  IconBrain,
  IconPlayerPlay,
  IconChartBar,
  IconInfoCircle,
  IconLink,
  IconSettings,
  IconChevronUp,
  IconChevronDown,
  IconCode,
  IconRefresh,
  IconTrash,
  IconSearch,
  IconTree,
  IconArrowsShuffle,
} from "@tabler/icons-react";
import explainAlgorithm from "../ai/explainGemini";
import AlgorithmExplanation from "../components/AlgorithmExplanation";

export default function TreeVisualizer() {
  const [tree, setTree] = useState(null);
  const [value, setValue] = useState("");
  const [traversalType, setTraversalType] = useState("inorder");
  const [traversalResult, setTraversalResult] = useState([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState("visualizer");
  const [showCode, setShowCode] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [stats, setStats] = useState({ nodes: 0, height: 0, leaves: 0 });
  const canvasRef = useRef(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");

  useEffect(() => {
    setControlsOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    updateTreeStats();
  }, [tree]);

  // Tree Node Class
  class TreeNode {
    constructor(value, x = 0, y = 0) {
      this.value = value;
      this.left = null;
      this.right = null;
      this.x = x;
      this.y = y;
      this.id = Math.random().toString(36).substr(2, 9);
    }
  }

  // Calculate responsive positioning
  const getCanvasWidth = () => {
    if (isSmallMobile) return 350;
    if (isMobile) return 400;
    if (isTablet) return 600;
    return 800;
  };

  const getNodeSize = () => {
    if (isSmallMobile) return 32;
    if (isMobile) return 36;
    return 40;
  };

  const getVerticalSpacing = () => {
    if (isSmallMobile) return 60;
    if (isMobile) return 70;
    return 90;
  };

  // Insert node with positioning
  const insertNode = (root, value, x = null, y = null, level = 1) => {
    if (x === null) x = getCanvasWidth() / 2;
    if (y === null) y = 50;

    if (!root) return new TreeNode(value, x, y);

    const offset = Math.max(getCanvasWidth() / (level * 4), 30);

    if (value < root.value) {
      root.left = insertNode(root.left, value, x - offset, y + getVerticalSpacing(), level + 1);
    } else if (value > root.value) {
      root.right = insertNode(root.right, value, x + offset, y + getVerticalSpacing(), level + 1);
    }

    return root;
  };

  // Recalculate positions
  const assignCoordinates = (node, x = null, y = 50, level = 1) => {
    if (!node) return;
    if (x === null) x = getCanvasWidth() / 2;

    node.x = x;
    node.y = y;

    const offset = Math.max(getCanvasWidth() / (level * 4), 30);

    assignCoordinates(node.left, x - offset, y + getVerticalSpacing(), level + 1);
    assignCoordinates(node.right, x + offset, y + getVerticalSpacing(), level + 1);
  };

  // Delete node
  const deleteNode = (root, value) => {
    if (!root) return null;

    if (value < root.value) {
      root.left = deleteNode(root.left, value);
    } else if (value > root.value) {
      root.right = deleteNode(root.right, value);
    } else {
      if (!root.left) return root.right;
      if (!root.right) return root.left;

      let minNode = root.right;
      while (minNode.left) minNode = minNode.left;
      root.value = minNode.value;
      root.right = deleteNode(root.right, minNode.value);
    }

    return root;
  };

  // Handle insert
  const handleInsert = () => {
    const numValue = parseInt(value);
    if (!value.trim() || isNaN(numValue)) {
      showMessage("Please enter a valid number", "error");
      return;
    }

    const updatedTree = insertNode(tree, numValue);
    assignCoordinates(updatedTree);
    setTree({ ...updatedTree });
    setValue("");
    showMessage(`Inserted ${numValue}`, "success");
  };

  // Handle delete
  const handleDelete = () => {
    const numValue = parseInt(value);
    if (!value.trim() || isNaN(numValue)) {
      showMessage("Please enter a valid number", "error");
      return;
    }

    const updatedTree = deleteNode(tree, numValue);
    if (updatedTree) {
      assignCoordinates(updatedTree);
      setTree({ ...updatedTree });
      showMessage(`Deleted ${numValue}`, "success");
    } else {
      setTree(null);
      showMessage(`Deleted ${numValue} (tree is now empty)`, "info");
    }
    setValue("");
  };

  // Generate sample tree
  const generateSampleTree = () => {
    const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45];
    let newTree = null;

    values.forEach((val) => {
      newTree = insertNode(newTree, val);
    });

    assignCoordinates(newTree);
    setTree(newTree);
    showMessage("Sample tree generated", "success");
  };

  // Generate random tree
  const generateRandomTree = () => {
    const count = Math.floor(Math.random() * 6) + 5;
    const values = [];

    while (values.length < count) {
      const val = Math.floor(Math.random() * 90) + 10;
      if (!values.includes(val)) {
        values.push(val);
      }
    }

    let newTree = null;
    values.forEach((val) => {
      newTree = insertNode(newTree, val);
    });

    assignCoordinates(newTree);
    setTree(newTree);
    showMessage("Random tree generated", "success");
  };

  // Clear tree
  const clearTree = () => {
    setTree(null);
    setTraversalResult([]);
    setHighlightedNodes([]);
    showMessage("Tree cleared", "info");
  };

  // Traversal animation
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const traverse = async (type) => {
    if (!tree) {
      showMessage("Tree is empty", "error");
      return;
    }

    setIsAnimating(true);
    setTraversalResult([]);
    setHighlightedNodes([]);
    showMessage(`Running ${type} traversal...`, "info");

    const nodes = [];
    const visit = (node) => {
      if (!node) return;

      if (type === "preorder") nodes.push(node);
      visit(node.left);
      if (type === "inorder") nodes.push(node);
      visit(node.right);
      if (type === "postorder") nodes.push(node);
    };

    visit(tree);

    const result = [];
    for (const node of nodes) {
      setHighlightedNodes([node.value]);
      result.push(node.value);
      setTraversalResult([...result]);
      await sleep(isMobile ? 600 : 500);
    }

    setHighlightedNodes([]);
    setIsAnimating(false);
    showMessage(`${type} traversal completed`, "success");
  };

  const handleRunTraversal = () => traverse(traversalType);

  // Search value
  const searchValue = async () => {
    const numValue = parseInt(value);
    if (!value.trim() || isNaN(numValue) || !tree) {
      showMessage("Enter a valid number and ensure tree exists", "error");
      return;
    }

    setIsAnimating(true);
    showMessage(`Searching for ${numValue}...`, "info");

    let current = tree;
    const path = [];

    while (current) {
      path.push(current.value);
      setHighlightedNodes([...path]);
      await sleep(isMobile ? 600 : 500);

      if (current.value === numValue) {
        showMessage(`Found ${numValue}!`, "success");
        setIsAnimating(false);
        setTimeout(() => setHighlightedNodes([]), 2000);
        return;
      }

      if (numValue < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    setHighlightedNodes([]);
    showMessage(`${numValue} not found`, "error");
    setIsAnimating(false);
  };

  // Update tree stats
  const updateTreeStats = () => {
    const countNodes = (node) => (node ? 1 + countNodes(node.left) + countNodes(node.right) : 0);
    const getHeight = (node) => (node ? 1 + Math.max(getHeight(node.left), getHeight(node.right)) : 0);
    const countLeaves = (node) => {
      if (!node) return 0;
      if (!node.left && !node.right) return 1;
      return countLeaves(node.left) + countLeaves(node.right);
    };

    setStats({
      nodes: countNodes(tree),
      height: getHeight(tree),
      leaves: countLeaves(tree),
    });
  };

  // AI Explanation
  const handleAIExplain = async () => {
    setIsLoadingAI(true);
    setShowExplanation(true);
    try {
      const explanation = await explainAlgorithm("tree");
      setAiExplanation(explanation);
    } catch {
      setAiExplanation("⚠️ Error generating AI explanation.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Show message
  const showMessage = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(""), 3000);
  };

  // Render edges
  const renderEdges = (node) => {
    if (!node) return [];
    const edges = [];

    const isInPath = highlightedNodes.includes(node.value);

    if (node.left) {
      edges.push(
        <line
          key={`${node.value}-${node.left.value}`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke={isInPath ? "#a855f7" : "#d8b4fe"}
          strokeWidth={isInPath ? 3 : 2}
          style={{ transition: "all 0.3s ease" }}
        />
      );
    }

    if (node.right) {
      edges.push(
        <line
          key={`${node.value}-${node.right.value}`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke={isInPath ? "#a855f7" : "#d8b4fe"}
          strokeWidth={isInPath ? 3 : 2}
          style={{ transition: "all 0.3s ease" }}
        />
      );
    }

    return [...edges, ...renderEdges(node.left), ...renderEdges(node.right)];
  };

  // Render nodes
  const renderNodes = (node) => {
    if (!node) return null;

    const nodeSize = getNodeSize();
    const isHighlighted = highlightedNodes.includes(node.value);

    return (
      <>
        <motion.div
          key={node.id}
          id={`node-${node.value}`}
          style={{
            position: "absolute",
            top: node.y - nodeSize / 2,
            left: node.x - nodeSize / 2,
            width: nodeSize,
            height: nodeSize,
            borderRadius: "50%",
            background: isHighlighted
              ? "linear-gradient(135deg, #a855f7, #c084fc)"
              : "linear-gradient(135deg, #faf5ff, #f3e8ff)",
            color: isHighlighted ? "#fff" : "#7c3aed",
            fontWeight: 700,
            fontSize: isSmallMobile ? "0.75rem" : isMobile ? "0.85rem" : "1rem",
            border: `${isMobile ? 2 : 3}px solid ${isHighlighted ? "#7c3aed" : "#c084fc"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isHighlighted
              ? "0 0 20px rgba(168,85,247,0.6)"
              : "0 3px 8px rgba(168,85,247,0.25)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          whileHover={{ scale: isAnimating ? 1 : 1.1 }}
          whileTap={{ scale: isAnimating ? 1 : 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {node.value}
        </motion.div>
        {renderNodes(node.left)}
        {renderNodes(node.right)}
      </>
    );
  };

  // Shimmer dot
  const dot = (color, delay) => ({
    width: isSmallMobile ? 8 : 10,
    height: isSmallMobile ? 8 : 10,
    background: color,
    borderRadius: "50%",
    animation: `bounce 1s infinite ${delay}`,
  });

  const canvasHeight = tree
    ? `${Math.max(stats.height * getVerticalSpacing() + 100, isSmallMobile ? 300 : isMobile ? 350 : 400)}px`
    : isSmallMobile ? "300px" : isMobile ? "350px" : "400px";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #ede9fe 100%)",
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
                "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(217,70,239,0.1))",
              padding: isMobile ? "1rem" : "1.5rem",
              borderRadius: 20,
              marginBottom: "1.5rem",
            }}
          >
            <IconGitBranch size={isMobile ? 48 : 64} color="#a855f7" stroke={2} />
          </div>
          <Title
            order={1}
            mb="sm"
            style={{
              fontSize: isMobile ? "1.8rem" : "2.4rem",
              background: "linear-gradient(90deg, #a855f7, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tree Algorithm Visualizer
          </Title>
          <Text size={isMobile ? "sm" : "lg"} color="dimmed">
            Build, visualize, and explore binary tree traversals with AI insights
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
                color={message.type === "success" ? "green" : message.type === "error" ? "red" : "violet"}
                radius="md"
              >
                {message.text}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab} color="violet">
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
                border: "1px solid rgba(234,222,255,0.6)",
                marginBottom: "1rem",
              }}
            >
              <Group position="apart" mb={isSmallMobile ? "xs" : "sm"}>
                <Text size={isSmallMobile ? "sm" : "md"} weight={700} color="#6b21a8">
                  Controls
                </Text>
                {(isMobile || isSmallMobile) && (
                  <ActionIcon
                    onClick={() => setControlsOpen((o) => !o)}
                    size="lg"
                    variant="light"
                    color="violet"
                  >
                    {controlsOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                  </ActionIcon>
                )}
              </Group>

              <Collapse in={controlsOpen}>
                <Stack spacing={isSmallMobile ? "xs" : "sm"}>
                  <Group grow={!isMobile} spacing={isSmallMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <NumberInput
                      placeholder="Enter value"
                      value={value}
                      onChange={(val) => setValue(val?.toString() || "")}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : "sm"}
                      radius="md"
                      min={1}
                      max={999}
                      style={{ flex: isMobile ? "1 1 100%" : "1 1 150px" }}
                    />

                    <Select
                      value={traversalType}
                      onChange={setTraversalType}
                      disabled={isAnimating}
                      data={[
                        { value: "inorder", label: "In-order" },
                        { value: "preorder", label: "Pre-order" },
                        { value: "postorder", label: "Post-order" },
                      ]}
                      size={isSmallMobile ? "xs" : "sm"}
                      radius="md"
                      style={{ flex: isMobile ? "1 1 100%" : "1 1 150px" }}
                    />
                  </Group>

                  <Group grow spacing={isSmallMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <Button
                      color="grape"
                      leftSection={<IconPlus size={isSmallMobile ? 12 : 14} />}
                      onClick={handleInsert}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      Insert
                    </Button>

                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconMinus size={isSmallMobile ? 12 : 14} />}
                      onClick={handleDelete}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      Delete
                    </Button>

                    <Button
                      color="blue"
                      variant="light"
                      leftSection={<IconSearch size={isSmallMobile ? 12 : 14} />}
                      onClick={searchValue}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                      style={{
                        fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
                        padding: isSmallMobile ? "0.4rem 0.35rem" : "0.45rem 0.55rem",
                        minWidth: isSmallMobile ? "70px" : "90px",
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      Search
                    </Button>
                    </Group>
                    <Button
                      color="violet"
                      leftSection={<IconPlayerPlay size={isSmallMobile ? 12 : 14} />}
                      onClick={handleRunTraversal}
                      disabled={isAnimating || !tree}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                      style={{
                        fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
                        padding: isSmallMobile ? "0.4rem 0.35rem" : "0.45rem 0.55rem",
                        minWidth: isSmallMobile ? "70px" : "90px",
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      Traverse
                    </Button>
                    

                  <Group grow spacing={isSmallMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <Button
                      color="cyan"
                      variant="light"
                      leftSection={<IconRefresh size={isSmallMobile ? 12 : 14} />}
                      onClick={generateSampleTree}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      Sample
                    </Button>

                    <Button
                      color="teal"
                      variant="light"
                      leftSection={<IconArrowsShuffle size={isSmallMobile ? 12 : 14} />}
                      onClick={generateRandomTree}
                      disabled={isAnimating}
                      size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
                      radius="md"
                      fullWidth={isMobile}
                    >
                      Random
                    </Button>

                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconTrash size={isSmallMobile ? 12 : 14} />}
                      onClick={clearTree}
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
                        gradient={{ from: "violet", to: "pink" }}
                        leftSection={<IconBrain size={14} />}
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
                      gradient={{ from: "violet", to: "pink" }}
                      leftSection={<IconBrain size={12} />}
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

            {/* Traversal Result */}
            {traversalResult.length > 0 && (
              <Card
                shadow="sm"
                padding={isSmallMobile ? "sm" : "md"}
                radius="md"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(234,222,255,0.6)",
                  marginBottom: "1rem",
                }}
              >
                <Text size={isSmallMobile ? "xs" : "sm"} weight={700} mb="xs" color="#6b21a8">
                  TRAVERSAL RESULT
                </Text>
                <Group spacing={isSmallMobile ? "xs" : "sm"}>
                  {traversalResult.map((val, index) => (
                    <Badge key={index} size={isSmallMobile ? "md" : "lg"} color="grape" variant="filled">
                      {val}
                    </Badge>
                  ))}
                </Group>
              </Card>
            )}

            {/* Tree Canvas */}
            <Card
              shadow="lg"
              radius="lg"
              ref={canvasRef}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(234,222,255,0.6)",
                overflow: "auto",
                height: canvasHeight,
                touchAction: "pan-y",
              }}
            >
              {tree ? (
  <div
    style={{
      position: "relative",
      width: getCanvasWidth(),
      height: "100%",
      margin: "0 auto",
    }}
  >
    <svg
      width={getCanvasWidth()}
      height="100%"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {renderEdges(tree)}
    </svg>
    {renderNodes(tree)}
  </div>
) : (
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
      color: "#6d28d9", // violet-700
    }}
  >
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(147,51,234,0.15))",
        padding: isMobile ? "1rem" : "1.25rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(147,51,234,0.15)",
        marginBottom: "1rem",
      }}
    >
      <IconTree size={isMobile ? 42 : 56} color="#7c3aed" stroke={2} />
    </div>

    <Title
      order={3}
      style={{
        color: "#6d28d9",
        fontSize: isMobile ? "1.2rem" : "1.5rem",
        marginBottom: "0.3rem",
      }}
    >
      No Tree Yet
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
      Add a root node to begin building your binary tree.
    </Text>
  </motion.div>
)}
            </Card>

            {/* Legend */}
            {!isSmallMobile && tree && (
              <Group position="center" spacing={isMobile ? "xs" : "md"} mt="md">
                {[
                  { color: "linear-gradient(135deg, #faf5ff, #f3e8ff)", label: "Node", border: "#c084fc" },
                  { color: "linear-gradient(135deg, #a855f7, #c084fc)", label: "Highlighted", border: "#7c3aed" },
                ].map((item, i) => (
                  <Group key={i} spacing={4}>
                    <div
                      style={{
                        width: isMobile ? 12 : 16,
                        height: isMobile ? 12 : 16,
                        borderRadius: "50%",
                        background: item.color,
                        border: `2px solid ${item.border}`,
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
            <Stack spacing={isSmallMobile ? "sm" : "md"}>
              <Group grow spacing={isSmallMobile ? "xs" : isMobile ? "sm" : "md"} style={{ flexDirection: isMobile ? "column" : "row" }}>
                {[
                  { color: "grape", icon: IconGitBranch, title: stats.nodes, text: "Total Nodes" },
                  { color: "pink", icon: IconChartBar, title: stats.height, text: "Tree Height" },
                  { color: "violet", icon: IconInfoCircle, title: stats.leaves, text: "Leaf Nodes" },
                ].map((s, i) => (
                  <Card
                    key={i}
                    shadow="sm"
                    padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
                    radius="lg"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(234,222,255,0.6)",
                    }}
                  >
                    <Stack align="center" spacing={isSmallMobile ? "xs" : "sm"}>
                      <s.icon size={isSmallMobile ? 32 : isMobile ? 40 : 48} color="#a855f7" />
                      <Title
                        order={isSmallMobile ? 3 : 2}
                        color={s.color}
                        style={{ fontSize: isSmallMobile ? "1.5rem" : isMobile ? "1.8rem" : "2rem" }}
                      >
                        {s.title}
                      </Title>
                      <Text size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"} weight={500} color="dimmed">
                        {s.text}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Group>

              {/* Complexity Info */}
              <Card
                shadow="sm"
                padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
                radius="lg"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(234,222,255,0.6)",
                }}
              >
                <Text size={isSmallMobile ? "sm" : "md"} weight={700} mb="md" color="#6b21a8">
                  TIME COMPLEXITY
                </Text>
                <Stack spacing={isSmallMobile ? "xs" : "sm"}>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Search:</Text>
                    <Badge color="green" variant="light" size={isSmallMobile ? "sm" : "md"}>O(log n)</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Insert:</Text>
                    <Badge color="yellow" variant="light" size={isSmallMobile ? "sm" : "md"}>O(log n)</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Delete:</Text>
                    <Badge color="red" variant="light" size={isSmallMobile ? "sm" : "md"}>O(log n)</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Traversal:</Text>
                    <Badge color="blue" variant="light" size={isSmallMobile ? "sm" : "md"}>O(n)</Badge>
                  </Group>
                </Stack>

                <Divider my={isSmallMobile ? "sm" : "md"} />

                <Text size={isSmallMobile ? "sm" : "md"} weight={700} mb="md" color="#6b21a8">
                  SPACE COMPLEXITY
                </Text>
                <Group position="apart">
                  <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Storage:</Text>
                  <Badge color="violet" variant="filled" size={isSmallMobile ? "md" : "lg"}>O(n)</Badge>
                </Group>
              </Card>

              {/* Progress Indicators */}
              {tree && (
                <Card
                  shadow="sm"
                  padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
                  radius="lg"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(234,222,255,0.6)",
                  }}
                >
                  <Text size={isSmallMobile ? "sm" : "md"} weight={700} mb="md" color="#6b21a8">
                    TREE BALANCE
                  </Text>
                  <Stack spacing={isSmallMobile ? "xs" : "sm"}>
                    <div>
                      <Group position="apart" mb={4}>
                        <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Height vs Optimal</Text>
                        <Text size={isSmallMobile ? "xs" : "sm"} weight={600} color="grape">
                          {Math.round((Math.ceil(Math.log2(stats.nodes + 1)) / stats.height) * 100)}%
                        </Text>
                      </Group>
                      <Progress
                        value={(Math.ceil(Math.log2(stats.nodes + 1)) / stats.height) * 100}
                        color="grape"
                        size={isSmallMobile ? "sm" : "md"}
                        radius="xl"
                      />
                    </div>

                    <div>
                      <Group position="apart" mb={4}>
                        <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Leaf Ratio</Text>
                        <Text size={isSmallMobile ? "xs" : "sm"} weight={600} color="pink">
                          {stats.nodes > 0 ? Math.round((stats.leaves / stats.nodes) * 100) : 0}%
                        </Text>
                      </Group>
                      <Progress
                        value={stats.nodes > 0 ? (stats.leaves / stats.nodes) * 100 : 0}
                        color="pink"
                        size={isSmallMobile ? "sm" : "md"}
                        radius="xl"
                      />
                    </div>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          {!isSmallMobile && (
            <Tabs.Panel value="settings" pt={isMobile ? "md" : "xl"}>
              <Card
                shadow="md"
                radius="lg"
                padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(234,222,255,0.6)",
                }}
              >
                <Title order={isSmallMobile ? 4 : 3} mb="lg" color="violet" align="center">
                  Tree Settings
                </Title>

                <Stack spacing="md" align="center">
                  <Group spacing="md" position="center" style={{ flexWrap: "wrap" }}>
                    <Button
                      color="violet"
                      variant="light"
                      leftSection={<IconRefresh size={16} />}
                      onClick={generateSampleTree}
                      disabled={isAnimating}
                      size={isMobile ? "sm" : "md"}
                    >
                      Load Sample Tree
                    </Button>

                    <Button
                      color="teal"
                      variant="light"
                      leftSection={<IconArrowsShuffle size={16} />}
                      onClick={generateRandomTree}
                      disabled={isAnimating}
                      size={isMobile ? "sm" : "md"}
                    >
                      Generate Random
                    </Button>

                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconTrash size={16} />}
                      onClick={clearTree}
                      disabled={isAnimating}
                      size={isMobile ? "sm" : "md"}
                    >
                      Clear Tree
                    </Button>
                  </Group>

                  {tree && (
                    <>
                      <Divider style={{ width: "100%" }} />
                      <Paper
                        padding="md"
                        radius="md"
                        style={{
                          background: "rgba(168,85,247,0.05)",
                          border: "1px solid rgba(168,85,247,0.2)",
                          width: "100%",
                        }}
                      >
                       <Text component="div" size="sm" weight={600} color="dimmed" align="center">
                          Current tree has {stats.nodes} nodes with height {stats.height}
                          {stats.height > Math.ceil(Math.log2(stats.nodes + 1)) && (
                          <Text size="xs" color="orange" mt={4} component="div">
                            ⚠️ Tree is unbalanced (height &gt; log₂(n))
                          </Text>
                            )}
                        </Text>
                      </Paper>
                    </>
                  )}
                </Stack>
              </Card>
            </Tabs.Panel>
          )}
        </Tabs>

        {/* AI Explanation */}
        {(showExplanation || aiExplanation) && (
          <Card
            shadow="lg"
            radius="lg"
            padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(234,222,255,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            {isLoadingAI ? (
              <Stack align="center" spacing={isSmallMobile ? "sm" : "md"}>
                <Title
                  order={isSmallMobile ? 4 : 3}
                  style={{ color: "#6b21a8", fontWeight: 700 }}
                >
                  Generating AI Explanation
                </Title>
                <Text
                  color="#7e22ce"
                  size={isSmallMobile ? "sm" : "md"}
                  style={{ letterSpacing: "0.3px" }}
                >
                  Analyzing tree traversal algorithms...
                </Text>
                <Group position="center" spacing={isSmallMobile ? 8 : 10} mt="md">
                  <div style={dot("#a855f7", "0s")} />
                  <div style={dot("#a855f7", "0.18s")} />
                  <div style={dot("#a855f7", "0.36s")} />
                </Group>
                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
                    40% { transform: scale(1.3); opacity: 1; }
                  }
                `}</style>
              </Stack>
            ) : (
              <AlgorithmExplanation content={aiExplanation} />
            )}
          </Card>
        )}

        {/* Code Modal */}
        <Modal
          opened={showCode}
          onClose={() => setShowCode(false)}
          title="Tree Implementation"
          size={isSmallMobile ? "full" : isMobile ? "lg" : "xl"}
          centered
          padding={isSmallMobile ? "sm" : "md"}
        >
          <Stack spacing="md">
            <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">
              Binary Search Tree implementation example:
            </Text>
            <Paper
              padding={isSmallMobile ? "xs" : "md"}
              radius="md"
              style={{
                background: "#1e293b",
                fontFamily: "monospace",
                fontSize: isSmallMobile ? "0.7rem" : "0.875rem",
                color: "#e2e8f0",
                overflow: "auto",
                maxHeight: isSmallMobile ? "300px" : "400px",
              }}
            >
              <pre style={{ margin: 0 }}>{`class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insert(root, value) {
  if (!root) return new TreeNode(value);
  
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else if (value > root.value) {
    root.right = insert(root.right, value);
  }
  
  return root;
}

function inorderTraversal(node) {
  if (!node) return;
  
  inorderTraversal(node.left);
  console.log(node.value);
  inorderTraversal(node.right);
}

function search(root, value) {
  if (!root) return false;
  if (root.value === value) return true;
  
  if (value < root.value) {
    return search(root.left, value);
  } else {
    return search(root.right, value);
  }
}`}</pre>
            </Paper>
          </Stack>
        </Modal>
      </Stack>
    </div>
  );
}