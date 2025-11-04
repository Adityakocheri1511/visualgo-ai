import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Input,
  Paper,
  Divider,
  Badge,
  ActionIcon,
  Collapse,
  Tabs,
  Progress,
  Alert,
  Tooltip,
  NumberInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLink,
  IconRotateClockwise,
  IconSearch,
  IconBrain,
  IconCirclePlus,
  IconCircleMinus,
  IconArrowBackUp,
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconTrash,
  IconArrowsShuffle,
  IconPlayerPlay,
  IconArrowRight,
  IconSettings,
} from "@tabler/icons-react";
import { useTheme } from "../context/ThemeContext";
import explainAlgorithm from "../ai/explainGemini";
import AlgorithmExplanation from "../components/AlgorithmExplanation";

export default function LinkedListVisualizer() {
  const { theme } = useTheme();

  const [list, setList] = useState([]);
  const [value, setValue] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [complexities, setComplexities] = useState(null);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("visualizer");
  const [message, setMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [stats, setStats] = useState({ nodes: 0, operations: 0, traversals: 0 });

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");

  useEffect(() => {
    setControlsOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, nodes: list.length }));
  }, [list]);

  // Insert node on Enter key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter" && !isAnimating) handleInsert();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const showMessage = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(""), 3000);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- Node Operations ---
  const handleInsert = () => {
    const v = value.trim();
    if (!v) {
      showMessage("Please enter a value", "error");
      return;
    }
    setList((prev) => [...prev, v]);
    setValue("");
    setStats((prev) => ({ ...prev, operations: prev.operations + 1 }));
    showMessage(`Inserted ${v}`, "success");
  };

  const handleInsertAtStart = () => {
    const v = value.trim();
    if (!v) {
      showMessage("Please enter a value", "error");
      return;
    }
    setList((prev) => [v, ...prev]);
    setValue("");
    setStats((prev) => ({ ...prev, operations: prev.operations + 1 }));
    showMessage(`Inserted ${v} at start`, "success");
  };

  const handleDelete = () => {
    const v = value.trim();
    if (!v) {
      showMessage("Please enter a value to delete", "error");
      return;
    }
    const newList = list.filter((node) => node !== v);
    if (newList.length === list.length) {
      showMessage(`${v} not found`, "error");
    } else {
      setList(newList);
      showMessage(`Deleted ${v}`, "success");
      setStats((prev) => ({ ...prev, operations: prev.operations + 1 }));
    }
    setValue("");
  };

  const handleReverse = async () => {
    if (list.length === 0) {
      showMessage("List is empty", "error");
      return;
    }
    setStats((prev) => ({ ...prev, traversals: prev.traversals + 1 }));
    setIsAnimating(true);
    showMessage("Reversing list...", "info");

    // Animate reversal
    for (let i = 0; i < list.length; i++) {
      setHighlightedIndex(i);
      await sleep(isMobile ? 400 : 300);
    }

    setList((prev) => [...prev].reverse());
    setHighlightedIndex(null);
    setIsAnimating(false);
    setStats((prev) => ({ ...prev, operations: prev.operations + 1 }));
    showMessage("List reversed", "success");
  };

  const handleFindMiddle = async () => {
    if (list.length === 0) {
      showMessage("List is empty", "error");
      return;
    }
    setStats((prev) => ({ ...prev, traversals: prev.traversals + 1 }));
    setIsAnimating(true);
    showMessage("Finding middle element...", "info");

    const mid = Math.floor(list.length / 2);

    // Animate to middle
    for (let i = 0; i <= mid; i++) {
      setHighlightedIndex(i);
      await sleep(isMobile ? 400 : 300);
    }

    showMessage(`Middle node: ${list[mid]}`, "success");
    
    setTimeout(() => {
      setHighlightedIndex(null);
      setIsAnimating(false);
    }, 2000);
  };

  const handleSearch = async () => {
    const v = value.trim();
    if (!v) {
      showMessage("Please enter a value to search", "error");
      return;
    }
    setStats((prev) => ({ ...prev, traversals: prev.traversals + 1 }));
    setIsAnimating(true);
    showMessage(`Searching for ${v}...`, "info");

    for (let i = 0; i < list.length; i++) {
      setHighlightedIndex(i);
      await sleep(isMobile ? 500 : 400);

      if (list[i] === v) {
        showMessage(`Found ${v} at position ${i}`, "success");
        setTimeout(() => {
          setHighlightedIndex(null);
          setIsAnimating(false);
        }, 2000);
        return;
      }
    }

    setHighlightedIndex(null);
    setIsAnimating(false);
    showMessage(`${v} not found`, "error");
  };

  const generateRandomList = () => {
    const size = Math.floor(Math.random() * 6) + 4;
    const values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setList(values.map(String));
    showMessage("Random list generated", "success");
  };

  const clearList = () => {
    setList([]);
    setValue("");
    setHighlightedIndex(null);
    setStats({ nodes: 0, operations: 0 });
    showMessage("List cleared", "info");
  };

  const dot = (color, delay) => ({
    width: isSmallMobile ? 8 : 10,
    height: isSmallMobile ? 8 : 10,
    background: color,
    borderRadius: "50%",
    animation: `bounce 1s infinite ${delay}`,
  });

  // --- AI Explanation ---
  const handleAIExplain = async () => {
    setIsLoadingAI(true);
    setShowExplanation(true);
    setAiExplanation("Loading...");

    try {
      const explanation = await explainAlgorithm("linkedlist");
      setAiExplanation(explanation);

      // Extract complexity info
      const lower = explanation.toLowerCase();
      const find = (pattern) => {
        const m = lower.match(pattern);
        return m ? m[1].replace(/<sup>|<\/sup>/g, "") : null;
      };
      setComplexities({
        best: find(/best[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
        average: find(/average[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
        worst: find(/worst[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
        space: find(/space[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
      });
    } catch (err) {
      console.error(err);
      setAiExplanation("⚠️ Error generating explanation.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getNodeSize = () => {
    if (isSmallMobile) return { padding: "8px 14px", fontSize: "0.85rem" };
    if (isMobile) return { padding: "10px 16px", fontSize: "0.95rem" };
    return { padding: "10px 18px", fontSize: "1rem" };
  };

  const nodeStyle = getNodeSize();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 80%)",
        padding: isSmallMobile ? "1rem 0.5rem" : isMobile ? "1.5rem 1rem" : isTablet ? "2rem" : "3rem 2rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <Stack
        spacing={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
        style={{ maxWidth: isTablet ? "100%" : 1400, margin: "0 auto" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))",
              padding: "1.25rem",
              borderRadius: "18px",
              marginBottom: "1rem",
            }}
          >
            <IconLink size={56} color={theme.accent} stroke={2} />
          </div>

          <Title
            order={1}
            mb="sm"
            style={{
              background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Linked List Visualizer
          </Title>

          <Text size="lg" color={theme.subtext}>
            Learn Linked Lists with step-by-step visual and AI-powered insights
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
        <Tabs value={activeTab} onChange={setActiveTab} color="indigo">
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
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(230,230,255,0.6)",
    marginBottom: "1rem",
  }}
>
  <Group position="apart" mb={isSmallMobile ? "xs" : "sm"}>
    <Text size={isSmallMobile ? "sm" : "md"} weight={700} color="#4338ca">
      Controls
    </Text>
    {(isMobile || isSmallMobile) && (
      <ActionIcon
        onClick={() => setControlsOpen((o) => !o)}
        size="lg"
        variant="light"
        color="indigo"
      >
        {controlsOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
      </ActionIcon>
    )}
  </Group>

  <Collapse in={controlsOpen}>
    <Stack spacing={isSmallMobile ? "xs" : "sm"}>
      {/* Node Input */}
      <Input
        placeholder="Enter node value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isAnimating}
        size={isSmallMobile ? "xs" : "sm"}
        radius="md"
      />

      {/* Define reusable responsive style */}
      {(() => {
        const buttonStyle = {
          fontSize: isSmallMobile ? "0.65rem" : isMobile ? "0.75rem" : "0.9rem",
          padding: isSmallMobile ? "0.35rem 0.5rem" : isMobile ? "0.4rem 0.65rem" : "0.5rem 0.8rem",
          fontWeight: 600,
          minWidth: isSmallMobile ? "70px" : isMobile ? "80px" : "100px",
          whiteSpace: "nowrap",
        };

        return (
          <>
            {/* Row 1 - Insert/Delete/Reverse */}
<Group
  spacing={isSmallMobile ? 4 : isMobile ? 6 : "sm"}
  grow
  style={{
    flexWrap: "nowrap",
    justifyContent: "space-between",
  }}
>
  <Button
    color="indigo"
    leftSection={<IconCirclePlus size={isSmallMobile ? 10 : 12} />}
    onClick={handleInsert}
    disabled={isAnimating}
    size={isSmallMobile ? "xs" : "sm"}
    radius="md"
    style={{
      flex: 1,
      fontSize: isSmallMobile ? "0.66rem" : "0.78rem",
      padding: isSmallMobile ? "0.4rem 0.35rem" : "0.45rem 0.55rem",
      minWidth: isSmallMobile ? "90px" : "100px",
      fontWeight: 600,
      letterSpacing: "0.2px",
      whiteSpace: "nowrap",
      lineHeight: 1.1,
      textAlign: "center",
      overflow: "visible",
    }}
  >
    Insert&nbsp;End
  </Button>

  <Button
    color="blue"
    variant="light"
    leftSection={<IconCirclePlus size={isSmallMobile ? 10 : 12} />}
    onClick={handleInsertAtStart}
    disabled={isAnimating}
    size={isSmallMobile ? "xs" : "sm"}
    radius="md"
    style={{
      flex: 1,
      fontSize: isSmallMobile ? "0.60rem" : "0.70rem",
      padding: isSmallMobile ? "0.4rem 0.25rem" : "0.45rem 0.35rem",
      minWidth: isSmallMobile ? "100px" : "90px",
      fontWeight: 600,
      letterSpacing: "0.2px",
      whiteSpace: "nowrap",
      lineHeight: 1.1,
      textAlign: "center",
      overflow: "visible",
    }}
  >
    Insert&nbsp;Start
  </Button>

  <Button
    color="red"
    variant="light"
    leftSection={<IconCircleMinus size={isSmallMobile ? 10 : 12} />}
    onClick={handleDelete}
    disabled={isAnimating}
    size={isSmallMobile ? "xs" : "sm"}
    radius="md"
    style={{
      flex: 1,
      fontSize: `clamp(0.64rem, 2.1vw, 0.8rem)`,
      padding: isSmallMobile ? "0.4rem 0.25rem" : "0.45rem 0.35rem",
      fontWeight: 600,
      letterSpacing: "0.2px",
      whiteSpace: "nowrap",
      lineHeight: 1.1,
      textAlign: "center",
      overflow: "visible",
    }}
  >
    Delete
  </Button>

  <Button
    color="cyan"
    variant="light"
    leftSection={<IconRotateClockwise size={isSmallMobile ? 10 : 12} />}
    onClick={handleReverse}
    disabled={isAnimating || list.length === 0}
    size={isSmallMobile ? "xs" : "sm"}
    radius="md"
    style={{
      flex: 1,
      fontSize: isSmallMobile ? "0.66rem" : "0.78rem",
      padding: isSmallMobile ? "0.4rem 0.25rem" : "0.45rem 0.35rem",
      fontWeight: 600,
      letterSpacing: "0.2px",
      whiteSpace: "nowrap",
      lineHeight: 1.1,
      textAlign: "center",
      overflow: "visible",
    }}
  >
    Reverse
  </Button>
</Group>

            {/* Row 2 - Find/Search/Random/Clear */}
<Group
  spacing={isSmallMobile ? 4 : isMobile ? 6 : "sm"}
  grow
  style={{
    flexWrap: "nowrap",
    justifyContent: "space-between",
  }}
>
  <Button
    color="teal"
    variant="light"
    leftSection={<IconSearch size={isSmallMobile ? 10 : 12} />}
    onClick={handleFindMiddle}
    disabled={isAnimating || list.length === 0}
    size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
    radius="md"
    style={{
      flex: 1,
      minWidth: "auto",
      fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
      padding: "0.45rem 0.4rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    {isSmallMobile ? "Middle" : "Find Middle"}
  </Button>

  <Button
    color="violet"
    variant="light"
    leftSection={<IconPlayerPlay size={isSmallMobile ? 10 : 12} />}
    onClick={handleSearch}
    disabled={isAnimating}
    size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
    radius="md"
    style={{
      flex: 1,
      minWidth: "auto",
      fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
      padding: "0.45rem 0.4rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    Search
  </Button>

  <Button
    color="orange"
    variant="light"
    leftSection={<IconArrowsShuffle size={isSmallMobile ? 10 : 12} />}
    onClick={generateRandomList}
    disabled={isAnimating}
    size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
    radius="md"
    style={{
      flex: 1,
      minWidth: "auto",
      fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
      padding: "0.45rem 0.4rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    Random
  </Button>

  <Button
    color="red"
    variant="light"
    leftSection={<IconTrash size={isSmallMobile ? 10 : 12} />}
    onClick={clearList}
    disabled={isAnimating}
    size={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
    radius="md"
    style={{
      flex: 1,
      minWidth: "auto",
      fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
      padding: "0.45rem 0.4rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    Clear
  </Button>
</Group>

            {/* AI Explain */}
            {!isSmallMobile && (
              <Button
                variant="gradient"
                gradient={{ from: "indigo", to: "violet" }}
                leftSection={<IconBrain size={14} />}
                onClick={handleAIExplain}
                disabled={isAnimating}
                size={isMobile ? "sm" : "md"}
                radius="md"
                fullWidth={isMobile}
                style={buttonStyle}
              >
                Explain with AI
              </Button>
            )}

            {isSmallMobile && (
              <Button
                variant="gradient"
                gradient={{ from: "indigo", to: "violet" }}
                leftSection={<IconBrain size={10} />}
                onClick={handleAIExplain}
                disabled={isAnimating}
                size="xs"
                radius="md"
                fullWidth
                style={buttonStyle}
              >
                AI Explain
              </Button>
            )}
          </>
        );
      })()}
    </Stack>
  </Collapse>
</Card>

            {/* Visualization Area */}
            <Card
              shadow="xl"
              padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
              radius="lg"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(230,230,255,0.6)",
                minHeight: isSmallMobile ? "200px" : isMobile ? "220px" : "250px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: list.length === 0 ? "center" : "flex-start",
                  alignItems: "center",
                  minHeight: isSmallMobile ? "150px" : isMobile ? "170px" : "180px",
                  gap: isSmallMobile ? "8px" : isMobile ? "12px" : "20px",
                  flexWrap: "wrap",
                  padding: "0.5rem",
                  overflowX: list.length > 5 ? "auto" : "visible",
                }}
              >
                {list.length === 0 ? (
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
      color: "#6d28d9",
    }}
  >
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(147,51,234,0.15))",
        padding: isMobile ? "1rem" : "1.25rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(147,51,234,0.15)",
        marginBottom: "1rem",
      }}
    >
      <IconLink size={isMobile ? 42 : 56} color="#7e22ce" stroke={2} />
    </div>

    <Title
      order={3}
      style={{
        color: "#6d28d9",
        fontSize: isMobile ? "1.2rem" : "1.5rem",
        marginBottom: "0.3rem",
      }}
    >
      No Linked List Yet
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
      Click <strong>“Add Node”</strong> to start building your linked list.
    </Text>
  </motion.div>
) : (
  <AnimatePresence>
    {list.map((node, index) => (
      <Group key={index} spacing={isSmallMobile ? 4 : isMobile ? 6 : 8} align="center">
        <Tooltip label={`Node ${index}: ${node}`} withArrow position="top">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background:
                highlightedIndex === index
                  ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                  : "linear-gradient(135deg, #6366f1, #3b82f6)",
              color: "white",
              borderRadius: isSmallMobile ? "6px" : "8px",
              padding: nodeStyle.padding,
              fontSize: nodeStyle.fontSize,
              fontWeight: 600,
              boxShadow:
                highlightedIndex === index
                  ? "0 0 20px rgba(245,158,11,0.6)"
                  : "0 4px 12px rgba(99,102,241,0.3)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              minWidth: isSmallMobile ? "40px" : "50px",
              textAlign: "center",
            }}
          >
            {node}
          </motion.div>
        </Tooltip>

        {index < list.length - 1 && (
          <IconArrowBackUp
            size={isSmallMobile ? 20 : isMobile ? 24 : 28}
            color="#4f46e5"
            style={{ transform: "rotate(180deg)", flexShrink: 0 }}
          />
        )}
      </Group>
    ))}
    <Text
      size={isSmallMobile ? "sm" : "md"}
      weight={700}
      color="dimmed"
      style={{ marginLeft: isSmallMobile ? "4px" : "8px" }}
    >
      → null
    </Text>
  </AnimatePresence>
)}
              </div>
            </Card>

            {/* Legend */}
            {!isSmallMobile && list.length > 0 && (
              <Group position="center" spacing={isMobile ? "xs" : "md"} mt="md">
                {[
                  { color: "linear-gradient(135deg, #6366f1, #3b82f6)", label: "Node" },
                  { color: "linear-gradient(135deg, #f59e0b, #ef4444)", label: "Highlighted" },
                ].map((item, i) => (
                  <Group key={i} spacing={4}>
                    <div
                      style={{
                        width: isMobile ? 12 : 16,
                        height: isMobile ? 12 : 16,
                        borderRadius: "4px",
                        background: item.color,
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
                  { color: "indigo", icon: IconLink, title: stats.nodes, text: "Total Nodes" },
                  { color: "blue", icon: IconChartBar, title: stats.operations, text: "Operations" },
                  { color: "grape", icon: IconArrowRight, title: stats.traversals, text: "Traversals"  },
                ].map((s, i) => (
                  <Card
                    key={i}
                    shadow="sm"
                    padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
                    radius="lg"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(230,230,255,0.6)",
                    }}
                  >
                    <Stack align="center" spacing={isSmallMobile ? "xs" : "sm"}>
                      <s.icon size={isSmallMobile ? 32 : isMobile ? 40 : 48} color="#4f46e5" />
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
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(230,230,255,0.6)",
                }}
              >
                <Text size={isSmallMobile ? "sm" : "md"} weight={700} mb="md" color="#4338ca">
                  TIME COMPLEXITY
                </Text>
                <Stack spacing={isSmallMobile ? "xs" : "sm"}>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Insert Head:</Text>
                    <Badge color="green" variant="light" size={isSmallMobile ? "sm" : "md"}>O(1)</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Insert Tail:</Text>
                    <Badge color="yellow" variant="light" size={isSmallMobile ? "sm" : "md"}>O(n)</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Search:</Text>
                    <Badge color="red" variant="light" size={isSmallMobile ? "sm" : "md"}>O(n)</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Delete:</Text>
                    <Badge color="orange" variant="light" size={isSmallMobile ? "sm" : "md"}>O(n)</Badge>
                  </Group>
                </Stack>

                <Divider my={isSmallMobile ? "sm" : "md"} />

                <Text size={isSmallMobile ? "sm" : "md"} weight={700} mb="md" color="#4338ca">
                  SPACE COMPLEXITY
                </Text>
                <Group position="apart">
                  <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Storage:</Text>
                  <Badge color="indigo" variant="filled" size={isSmallMobile ? "md" : "lg"}>O(n)</Badge>
                </Group>
              </Card>

              {/* Progress */}
              {stats.operations > 0 && (
                <Card
                  shadow="sm"
                  padding={isSmallMobile ? "md" : isMobile ? "lg" : "xl"}
                  radius="lg"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(230,230,255,0.6)",
                  }}
                >
                  <Text size={isSmallMobile ? "sm" : "md"} weight={700} mb="md" color="#4338ca">
                    ACTIVITY PROGRESS
                  </Text>
                  <Stack spacing={isSmallMobile ? "xs" : "sm"}>
                    <div>
                      <Group position="apart" mb={4}>
                        <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">Operations</Text>
                        <Text size={isSmallMobile ? "xs" : "sm"} weight={600} color="indigo">
                          {stats.operations}
                        </Text>
                      </Group>
                      <Progress
                        value={Math.min((stats.operations / 20) * 100, 100)}
                        color="indigo"
                        size={isSmallMobile ? "sm" : "md"}
                        radius="xl"
                      />
                    </div>

                    <div>
                      <Group position="apart" mb={4}>
                        <Text size={isSmallMobile ? "xs" : "sm"} color="dimmed">List Capacity</Text>
                        <Text size={isSmallMobile ? "xs" : "sm"} weight={600} color="blue">
                          {stats.nodes}/20
                        </Text>
                      </Group>
                      <Progress
                        value={(stats.nodes / 20) * 100}
                        color="blue"
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
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(230,230,255,0.6)",
                }}
              >
                <Title order={isSmallMobile ? 4 : 3} mb="lg" color="indigo" align="center">
                  List Settings
                </Title>

                <Stack spacing="md" align="center">
                  <Group spacing="md" position="center" style={{ flexWrap: "wrap" }}>
                    <Button
                      color="orange"
                      variant="light"
                      leftSection={<IconArrowsShuffle size={16} />}
                      onClick={generateRandomList}
                      disabled={isAnimating}
                      size={isMobile ? "sm" : "md"}
                    >
                      Generate Random List
                    </Button>

                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconTrash size={16} />}
                      onClick={clearList}
                      disabled={isAnimating}
                      size={isMobile ? "sm" : "md"}
                    >
                      Clear List
                    </Button>
                  </Group>

                  {list.length > 0 && (
                    <>
                      <Divider style={{ width: "100%" }} />
                      <Paper
                        padding="md"
                        radius="md"
                        style={{
                          background: "rgba(59,130,246,0.05)",
                          border: "1px solid rgba(59,130,246,0.2)",
                          width: "100%",
                        }}
                      >
                        <Text size="sm" weight={600} color="dimmed" align="center">
                          Current list has {stats.nodes} nodes
                          {stats.nodes > 15 && (
                            <Text size="xs" color="orange" mt={4}>
                              ⚠️ Large list - operations may be slower
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
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(230,230,255,0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            {isLoadingAI ? (
              <Stack align="center" spacing={isSmallMobile ? "sm" : "md"}>
                <Title
                  order={isSmallMobile ? 4 : 3}
                  style={{ color: "#1e3a8a", fontWeight: 700 }}
                >
                  Generating AI Explanation
                </Title>
                <Text
                  color="#475569"
                  size={isSmallMobile ? "sm" : "md"}
                  style={{ letterSpacing: "0.3px" }}
                >
                  Analyzing linked list operations...
                </Text>
                <Group position="center" spacing={isSmallMobile ? 8 : 12} mt="md">
                  <div style={dot("#4f46e5", "0s")} />
                  <div style={dot("#4f46e5", "0.2s")} />
                  <div style={dot("#4f46e5", "0.4s")} />
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
      </Stack>
    </div>
  );
}