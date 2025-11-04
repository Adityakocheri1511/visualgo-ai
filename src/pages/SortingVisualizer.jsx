import React, { useState, useEffect, useRef } from "react";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Slider,
  Select,
  Badge,
  Divider,
  Loader,
  Tabs,
  Collapse,
  ActionIcon,
  Alert,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBrain,
  IconArrowsShuffle,
  IconPlayerPlay,
  IconRefresh,
  IconTrendingUp,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconLink,
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react";
import { useTheme } from "../context/ThemeContext";
import explainAlgorithm from "../ai/explainGemini";
import AlgorithmExplanation from "../components/AlgorithmExplanation";

/**
 * SortingVisualizer.jsx
 * - 5 algorithms: bubble, selection, insertion, merge, quick
 * - Responsive and styled like LinkedListVisualizer
 * - Pause/resume, reset, new array, speed, size
 * - AI explain panel with shimmer
 */

const ALGORITHMS = {
  bubble: { label: "Bubble Sort" },
  selection: { label: "Selection Sort" },
  insertion: { label: "Insertion Sort" },
  merge: { label: "Merge Sort" },
  quick: { label: "Quick Sort" },
};

export default function SortingVisualizer() {
  const { theme } = useTheme() || { theme: {}, accent: "#06b6d4", subtext: "#64748b" };

  // Responsive
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // state
  const [array, setArray] = useState([]);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [speed, setSpeed] = useState(80); // ms
  const [arraySize, setArraySize] = useState(40);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comparing, setComparing] = useState([]); // pair indexes
  const [swapping, setSwapping] = useState([]); // pair indexes
  const [sorted, setSorted] = useState([]); // indexes considered sorted
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("visualizer");
  const [message, setMessage] = useState("");

  // refs to coordinate pause/stop from async sorting loops
  const pauseRef = useRef(false);
  const stopRef = useRef(false);

  // ensure controlsOpen default for mobile vs desktop
  useEffect(() => setControlsOpen(!isMobile), [isMobile]);

  // generate array
  const generateArray = (size = arraySize) => {
    const newArray = Array.from({ length: size }, () =>
      Math.floor(Math.random() * 100) + 5
    );
    setArray(newArray);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setStats({ comparisons: 0, swaps: 0 });
    setIsSorting(false);
    pauseRef.current = false;
    stopRef.current = false;
  };

  useEffect(() => {
    generateArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // regenerate when arraySize changes (but only if not sorting)
    if (!isSorting) generateArray(arraySize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arraySize]);

  // sleep that respects pause + stop
  const sleep = (ms) =>
    new Promise((resolve) => {
      const check = () => {
        if (stopRef.current) return resolve();
        if (!pauseRef.current) return setTimeout(resolve, ms);
        setTimeout(check, 50);
      };
      check();
    });

  const showMessage = (txt, type = "info") => {
    setMessage({ text: txt, type });
    setTimeout(() => setMessage(""), 3000);
  };

  // --------- Sorting algorithm implementations (animated) ----------

  // helper to swap in array immutably and update state
  const swapAndSet = (arr, i, j) => {
    const copy = [...arr];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setArray(copy);
  };

  // Bubble Sort
  const bubbleSort = async () => {
    const arr = [...array];
    setIsSorting(true);
    setStats({ comparisons: 0, swaps: 0 });
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopRef.current) return finishEarly();
        setComparing([j, j + 1]);
        setStats((s) => ({ ...s, comparisons: s.comparisons + 1 }));
        await sleep(speed);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapAndSet(arr, j, j + 1);
          setSwapping([j, j + 1]);
          setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
          await sleep(speed);
          setSwapping([]);
        }
      }
      setSorted((prev) => [...prev, n - 1 - i]);
    }
    setSorted([...Array(n).keys()]);
    setComparing([]);
    setIsSorting(false);
    showMessage("Bubble sort completed", "success");
  };

  // Selection Sort
  const selectionSort = async () => {
    const arr = [...array];
    setIsSorting(true);
    setStats({ comparisons: 0, swaps: 0 });
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (stopRef.current) return finishEarly();
        setComparing([minIdx, j]);
        setStats((s) => ({ ...s, comparisons: s.comparisons + 1 }));
        await sleep(speed);
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swapAndSet(arr, i, minIdx);
        setSwapping([i, minIdx]);
        setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
        await sleep(speed);
        setSwapping([]);
      }
      setSorted((prev) => [...prev, i]);
    }
    setComparing([]);
    setIsSorting(false);
    showMessage("Selection sort completed", "success");
  };

  // Insertion Sort
  const insertionSort = async () => {
    const arr = [...array];
    setIsSorting(true);
    setStats({ comparisons: 0, swaps: 0 });
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      if (stopRef.current) return finishEarly();
      let key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        setComparing([j, j + 1]);
        setStats((s) => ({ ...s, comparisons: s.comparisons + 1 }));
        await sleep(speed);
        arr[j + 1] = arr[j];
        swapAndSet(arr, j + 1, j); // visually shift
        setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
        j = j - 1;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSorted((prev) => [...prev, i]);
      await sleep(speed);
    }
    setComparing([]);
    setIsSorting(false);
    showMessage("Insertion sort completed", "success");
  };

  // Merge Sort (animated using merging steps)
  const mergeSort = async () => {
    let arr = [...array];
    setIsSorting(true);
    setStats({ comparisons: 0, swaps: 0 });

    const merge = async (left, mid, right) => {
      if (stopRef.current) return;
      const n1 = mid - left + 1;
      const n2 = right - mid;
      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      while (i < n1 && j < n2) {
        setComparing([left + i, mid + 1 + j]);
        setStats((s) => ({ ...s, comparisons: s.comparisons + 1 }));
        await sleep(speed);
        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        setArray([...arr]);
        k++;
        await sleep(speed);
      }
      while (i < n1) {
        arr[k] = L[i];
        i++; k++;
        setArray([...arr]);
        await sleep(speed);
      }
      while (j < n2) {
        arr[k] = R[j];
        j++; k++;
        setArray([...arr]);
        await sleep(speed);
      }
    };

    const mergeSortRec = async (l, r) => {
      if (l >= r || stopRef.current) return;
      const m = Math.floor((l + r) / 2);
      await mergeSortRec(l, m);
      await mergeSortRec(m + 1, r);
      await merge(l, m, r);
    };

    await mergeSortRec(0, arr.length - 1);
    setSorted([...Array(arr.length).keys()]);
    setComparing([]);
    setIsSorting(false);
    showMessage("Merge sort completed", "success");
  };

  // Quick Sort (animated)
  const quickSort = async () => {
    let arr = [...array];
    setIsSorting(true);
    setStats({ comparisons: 0, swaps: 0 });

    const partition = async (low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j <= high - 1; j++) {
        if (stopRef.current) return -1;
        setComparing([j, high]);
        setStats((s) => ({ ...s, comparisons: s.comparisons + 1 }));
        await sleep(speed);
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swapAndSet(arr, i, j);
          setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
          setSwapping([i, j]);
          await sleep(speed);
          setSwapping([]);
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swapAndSet(arr, i + 1, high);
      setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
      await sleep(speed);
      return i + 1;
    };

    const qsort = async (low, high) => {
      if (low < high) {
        if (stopRef.current) return;
        const pi = await partition(low, high);
        if (pi === -1) return;
        await qsort(low, pi - 1);
        await qsort(pi + 1, high);
      }
    };

    await qsort(0, arr.length - 1);
    setSorted([...Array(arr.length).keys()]);
    setComparing([]);
    setIsSorting(false);
    showMessage("Quick sort completed", "success");
  };

  // helper to gracefully stop/pause
  const finishEarly = () => {
    setComparing([]);
    setSwapping([]);
    setIsSorting(false);
  };

  // wrapper to start/pause/resume sorts
  const handleSort = async () => {
    if (isSorting) {
      // toggle pause/resume
      pauseRef.current = !pauseRef.current;
      setIsPaused(pauseRef.current);
      return;
    }

    // start new sort
    stopRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);
    setIsSorting(true);
    setComparing([]);
    setSwapping([]);
    setSorted([]);

    switch (algorithm) {
      case "bubble":
        await bubbleSort();
        break;
      case "selection":
        await selectionSort();
        break;
      case "insertion":
        await insertionSort();
        break;
      case "merge":
        await mergeSort();
        break;
      case "quick":
        await quickSort();
        break;
      default:
        await bubbleSort();
    }
  };

  const handleReset = () => {
    stopRef.current = true;
    pauseRef.current = false;
    setIsSorting(false);
    setIsPaused(false);
    generateArray(arraySize);
  };

  const handleNewArray = () => {
    if (isSorting) {
      showMessage("Stop sorting before changing the array", "error");
      return;
    }
    generateArray(arraySize);
    showMessage("New array generated", "success");
  };

  // AI explain handler
  const handleAIExplain = async () => {
    setIsLoadingAI(true);
    setShowExplanation(true);
    try {
      const explanation = await explainAlgorithm(algorithm);
      setAiExplanation(explanation);
    } catch {
      setAiExplanation("⚠️ Error generating explanation.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // bar color logic
  const getBarColor = (index) => {
    if (sorted.includes(index)) return "#06b6d4"; // cyan
    if (swapping.includes(index)) return "#0ea5e9"; // sky blue
    if (comparing.includes(index)) return "#38bdf8"; // lighter cyan
    return "#0284c7"; // base blue
  };

  // shimmer dot for AI
  const dot = (color, delay) => ({
    width: isMobile ? 8 : 10,
    height: isMobile ? 8 : 10,
    background: color,
    borderRadius: "50%",
    animation: `bounce 1s infinite ${delay}`,
  });

  // layout sizes
  const canvasHeight = isMobile ? 300 : isMobile ? 360 : 420;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        background:
          "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 40%, #dbeafe 90%)",
        padding: isMobile ? "1rem 0.5rem" : isMobile ? "1.5rem 1rem" : isTablet ? "2rem" : "3rem 2rem",
      }}
    >
      <Stack spacing="xl" style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
                "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(6,182,212,0.1))",
              padding: isMobile ? "1rem" : "1.5rem",
              borderRadius: "20px",
              marginBottom: "1rem",
            }}
          >
            <IconTrendingUp size={isMobile ? 48 : 64} color="#06b6d4" stroke={2.2} />
          </div>

          <Title
            order={1}
            mb="sm"
            style={{
              background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Sorting Algorithm Visualizer
          </Title>

          <Text size={isMobile ? "sm" : "lg"} color="dimmed">
            Visualize, interact, and master sorting algorithms in real-time
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

        {/* ✅ Tabs Section (Responsive Fixed Version) */}
        <Tabs value={activeTab} onChange={setActiveTab} color="cyan">
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

          {/* Visualizer Panel */}
          <Tabs.Panel value="visualizer" pt={isMobile ? "md" : "xl"}>
            {/* Control Panel */}
            <Card
              shadow="md"
              padding={isMobile ? "sm" : isMobile ? "md" : "lg"}
              radius="lg"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(186,230,253,0.6)",
                marginBottom: "1rem",
              }}
            >
              <Group position="apart" mb={isMobile ? "xs" : "sm"}>
                <Text size={isMobile ? "sm" : "md"} weight={700} color="#075985">
                  Controls
                </Text>
                {(isMobile || isMobile) && (
                  <ActionIcon
                    onClick={() => setControlsOpen((o) => !o)}
                    size="lg"
                    variant="light"
                    color="cyan"
                  >
                    {controlsOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                  </ActionIcon>
                )}
              </Group>

              <Collapse in={controlsOpen}>
                <Stack spacing={isMobile ? "xs" : "sm"}>
                  <Group grow spacing={isMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <div style={{ width: isMobile ? "100%" : "220px" }}>
                      <Text size="xs" c="dimmed" fw={600} mb={6}>
                        Algorithm
                      </Text>
                      <Select
                        value={algorithm}
                        onChange={setAlgorithm}
                        data={Object.entries(ALGORITHMS).map(([key, v]) => ({ value: key, label: v.label }))}
                        size={isMobile ? "xs" : "sm"}
                        radius="md"
                      />
                    </div>

                    <div style={{ width: isMobile ? "100%" : "220px" }}>
                      <Text size="xs" c="dimmed" fw={600} mb={6}>
                        Speed ({speed} ms)
                      </Text>
                      <Slider
                        min={10}
                        max={300}
                        step={10}
                        value={speed}
                        onChange={setSpeed}
                        color="cyan"
                        size={isMobile ? "xs" : "sm"}
                      />
                    </div>

                    <div style={{ width: isMobile ? "100%" : "220px" }}>
                      <Text size="xs" c="dimmed" fw={600} mb={6}>
                        Array Size ({arraySize})
                      </Text>
                      <Slider
                        min={10}
                        max={120}
                        value={arraySize}
                        onChange={(v) => setArraySize(v)}
                        color="cyan"
                        size={isMobile ? "xs" : "sm"}
                      />
                    </div>
                  </Group>

                  <Group grow spacing={isMobile ? "xs" : "sm"} style={{ flexWrap: "wrap" }}>
                    <Button
                      color="cyan"
                      leftSection={<IconPlayerPlay size={isMobile ? 12 : 14} />}
                      onClick={handleSort}
                      radius="md"
                      size={isMobile ? "xs" : isMobile ? "sm" : "md"}
                      fullWidth={isMobile}
                    >
                      {isSorting ? (isPaused ? "Resume" : "Pause") : "Start"}
                    </Button>

                    <Button
                      color="gray"
                      leftSection={<IconRefresh size={isMobile ? 12 : 14} />}
                      onClick={handleReset}
                      variant="outline"
                      radius="md"
                      size={isMobile ? "xs" : isMobile ? "sm" : "md"}
                      fullWidth={isMobile}
                    >
                      Reset
                    </Button>

                    <Button
                      color="cyan"
                      leftSection={<IconArrowsShuffle size={isMobile ? 12 : 14} />}
                      onClick={handleNewArray}
                      variant="light"
                      radius="md"
                      size={isMobile ? "xs" : isMobile ? "sm" : "md"}
                      fullWidth={isMobile}
                    >
                      New Array
                    </Button>

                    {!isMobile && (
                      <Button
                        variant="gradient"
                        gradient={{ from: "#06b6d4", to: "#3b82f6" }}
                        leftSection={<IconBrain size={14} />}
                        onClick={handleAIExplain}
                        radius="md"
                        size={isMobile ? "sm" : "md"}
                      >
                        Explain with AI
                      </Button>
                    )}
                  </Group>

                  {isMobile && (
                    <Button
                      variant="gradient"
                      gradient={{ from: "#06b6d4", to: "#3b82f6" }}
                      leftSection={<IconBrain size={12} />}
                      onClick={handleAIExplain}
                      radius="md"
                      size="xs"
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
              padding={isMobile ? "md" : "lg"}
              radius="lg"
              style={{
                height: canvasHeight,
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(186,230,253,0.6)",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  padding: isMobile ? "0 6px" : "0 1rem",
                  gap: "2px",
                  overflowX: array.length > 60 ? "auto" : "hidden",
                }}
              >
                {array.map((value, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(value / 105) * 100}%`, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      width: `${Math.max(6, 100 / Math.min(array.length, 100))}%`,
                      background: getBarColor(idx),
                      borderRadius: "4px 4px 0 0",
                      boxShadow: "0 2px 8px rgba(14,165,233,0.18)",
                      display: "inline-block",
                    }}
                    title={`${value}`}
                  />
                ))}
              </div>
            </Card>

            {/* AI Explanation Panel */}
            {(showExplanation || aiExplanation) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }}>
                <Card shadow="lg" radius="lg" p="xl" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(186,230,253,0.6)" }}>
                  {isLoadingAI ? (
                    <Stack align="center" spacing="sm">
                      <Title order={isMobile ? 4 : 3} style={{ color: "#075985", fontWeight: 700 }}>
                        Generating AI Explanation
                      </Title>
                      <Text color="#0f172a" size={isMobile ? "sm" : "md"}>Analyzing {ALGORITHMS[algorithm].label}...</Text>
                      <Group position="center" spacing={isMobile ? 8 : 10} mt="md">
                        <div style={dot("#06b6d4", "0s")} />
                        <div style={dot("#06b6d4", "0.18s")} />
                        <div style={dot("#06b6d4", "0.36s")} />
                      </Group>
                      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.6} 40%{transform:scale(1.3);opacity:1} }`}</style>
                    </Stack>
                  ) : (
                    <AlgorithmExplanation content={aiExplanation} />
                  )}
                </Card>
              </motion.div>
            )}
          </Tabs.Panel>



          {/* Stats Panel */}
          <Tabs.Panel value="stats" pt={isMobile ? "md" : "xl"}>
            <Stack spacing={isMobile ? "sm" : "md"}>
              <Group grow spacing={isMobile ? "xs" : isMobile ? "sm" : "md"} style={{ flexDirection: isMobile ? "column" : "row" }}>
                {[
                  { color: "cyan", icon: IconTrendingUp, title: array.length, text: "Array Size" },
                  { color: "teal", icon: IconInfoCircle, title: stats.comparisons, text: "Comparisons" },
                  { color: "violet", icon: IconBrain, title: stats.swaps, text: "Swaps" },
                ].map((s, i) => (
                  <Card key={i} shadow="sm" padding={isMobile ? "md" : isMobile ? "lg" : "xl"} radius="lg" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(186,230,253,0.6)" }}>
                    <Stack align="center" spacing={isMobile ? "xs" : "sm"}>
                      <s.icon size={isMobile ? 32 : isMobile ? 40 : 48} color="#06b6d4" />
                      <Title order={isMobile ? 3 : 2} color={s.color} style={{ fontSize: isMobile ? "1.5rem" : isMobile ? "1.8rem" : "2rem" }}>
                        {s.title}
                      </Title>
                      <Text size={isMobile ? "xs" : isMobile ? "sm" : "md"} weight={500} color="dimmed">{s.text}</Text>
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

          {/* Settings */}
          {!isMobile && (
            <Tabs.Panel value="settings" pt={isMobile ? "md" : "xl"}>
              <Card shadow="md" radius="lg" padding={isMobile ? "md" : isMobile ? "lg" : "xl"} style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(186,230,253,0.6)" }}>
                <Title order={isMobile ? 4 : 3} mb="lg" color="cyan" align="center">Visualizer Settings</Title>
                <Stack spacing="md" align="center">
                  <Group spacing="md" position="center" style={{ flexWrap: "wrap" }}>
                    <Button color="cyan" variant="light" leftSection={<IconArrowsShuffle size={16} />} onClick={() => generateArray(arraySize)} size={isMobile ? "sm" : "md"}>Regenerate Array</Button>
                    <Button color="gray" variant="light" leftSection={<IconRefresh size={16} />} onClick={handleReset} size={isMobile ? "sm" : "md"}>Reset</Button>
                  </Group>
                </Stack>
              </Card>
            </Tabs.Panel>
          )}
        </Tabs>

      </Stack>
    </div>
  );
}