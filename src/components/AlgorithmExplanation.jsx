import React, { useState, useMemo } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Collapse,
  ActionIcon,
  Code,
  Paper,
  Divider,
} from "@mantine/core";
import { useTheme } from "../context/ThemeContext";
import {
  IconBulb,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconCheck,
  IconChartBar,
} from "@tabler/icons-react";

export default function AlgorithmExplanation({ content }) {
  const { theme } = useTheme();
  const [copiedBlocks, setCopiedBlocks] = useState({});
  const [open, setOpen] = useState(true);

  const normalizedContent =
    typeof content === "string" ? content.trim() : content ? String(content) : "";

  // Parse complexity info
  const complexities = useMemo(() => {
    if (!normalizedContent) return {};
    const lower = normalizedContent.toLowerCase();
    const find = (pattern) => {
      const m = lower.match(pattern);
      return m ? m[1].replace(/<sup>|<\/sup>/g, "") : null;
    };
    return {
      best: find(/best[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
      average: find(/average[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
      worst: find(/worst[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
      space: find(/space[^:\n]*[:→-]\s*([oO]\([^\)\n]+\))/),
    };
  }, [normalizedContent]);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedBlocks((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedBlocks((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  // Empty state
  if (!normalizedContent || normalizedContent.trim() === "") {
    return (
      <Card shadow="md" padding="xl" radius="lg" style={{ background: theme.card, border: theme.cardBorder, textAlign: "center" }}>
        <IconBulb size={40} color={theme.accent} style={{ marginBottom: "1rem" }} />
        <Title order={3} mb="sm" style={{ color: theme.text }}>
          Waiting for AI Explanation
        </Title>
        <Text color={theme.subtext}>
          Click "Explain with AI" to generate detailed algorithm insights.
        </Text>
      </Card>
    );
  }

  // Loading shimmer
  if (normalizedContent.startsWith("🤖 Thinking") || normalizedContent === "Loading...") {
    return (
      <Card
        shadow="md"
        padding="xl"
        radius="lg"
        style={{
          background: theme.card,
          border: theme.cardBorder,
          textAlign: "center",
          minHeight: "240px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title order={3} mb="sm" style={{ color: theme.text }}>
          Generating AI Explanation
        </Title>
        <Text color={theme.subtext} mb="lg">
          Analyzing algorithm and crafting detailed insights...
        </Text>
        <Group spacing={10} position="center">
          <div style={dot(theme.accent, "0s")} />
          <div style={dot(theme.accent, "0.2s")} />
          <div style={dot(theme.accent, "0.4s")} />
        </Group>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
            40% { transform: scale(1.3); opacity: 1; }
          }
        `}</style>
      </Card>
    );
  }

  // Full AI Explanation
  return (
    <Stack spacing="md">
      {/* Static Time & Space Complexity */}
      {(complexities.best || complexities.average || complexities.worst) && (
        <Card
          shadow="lg"
          radius="lg"
          p="xl"
          style={{
            background: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(186,230,253,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Group mb="md">
            <IconChartBar size={24} color={theme.accent} />
            <Title order={3} style={{ color: theme.text }}>
              Time & Space Complexity
            </Title>
          </Group>
          <Group grow>
            {complexities.best && renderComplexityCard("Best Case", complexities.best, "#10b981")}
            {complexities.average && renderComplexityCard("Average Case", complexities.average, "#f59e0b")}
            {complexities.worst && renderComplexityCard("Worst Case", complexities.worst, "#ef4444")}
            {complexities.space && renderComplexityCard("Space", complexities.space, theme.accent)}
          </Group>
        </Card>
      )}

      {/* Collapsible Detailed Section */}
      <Card
        shadow="lg"
        radius="lg"
        p="xl"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(186,230,253,0.5)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Group position="apart" mb="md" style={{ cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>
          <Group spacing="sm">
            <IconBulb size={22} color={theme.accent} />
            <Title order={3} style={{ color: theme.text }}>
              Detailed Explanation
            </Title>
          </Group>
          {open ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
        </Group>

        <Collapse in={open}>
          <Stack spacing="md">
            {renderCard("Concept Overview", parseSection("concept overview", normalizedContent), theme)}
            {renderCard("Visualization", renderImage(normalizedContent), theme)}
            {renderCard("Step-by-Step Explanation", parseSection("step-by-step", normalizedContent), theme)}
            {renderCodeExamples(normalizedContent, handleCopy, copiedBlocks, theme)}

            {/* ✅ Example Walkthrough restored with Markdown Renderer */}
            {renderMarkdownCard(
              "Example Walkthrough",
              parseSection("example walkthrough", normalizedContent),
              theme
            )}

            {renderCard("Real-World Analogy", parseSection("real-world analogy", normalizedContent), theme)}
            {renderCard("Summary", parseSection("summary", normalizedContent), theme)}
          </Stack>
        </Collapse>
      </Card>
    </Stack>
  );
}

// === Helper Functions ===
const dot = (color, delay) => ({
  width: 10,
  height: 10,
  background: color,
  borderRadius: "50%",
  animation: `bounce 1s infinite ${delay}`,
});

const renderComplexityCard = (label, value, color) => {
    // Apply <sup> only when a number follows a variable (like n2, log2)
    const formattedValue = value
      .replace(/([a-zA-Z])(\d+)/g, "$1<sup>$2</sup>") // turns n2 → n<sup>2</sup>
      .replace(/\s+/g, ""); // remove spaces safely
  
    return (
      <Paper
        key={label}
        p="md"
        radius="md"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}40`,
          textAlign: "center",
        }}
      >
        <Text size="xs" weight={600} color="dimmed" mb={4}>
          {label}
        </Text>
        <Badge
          style={{
            background: color,
            color: "white",
            fontSize: "1rem",
          }}
          size="lg"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: formattedValue.toUpperCase(),
            }}
          />
        </Badge>
      </Paper>
    );
  };

const renderCard = (title, content, theme) =>
  content && (
    <Card
  shadow="sm"
  radius="lg"
  p="lg"
  style={{
    background: theme.card,
    border: theme.cardBorder,
    textAlign: "left",  // ✅ ensures heading and content align left
  }}
>
  <Title
    order={4}
    mb="sm"
    style={{
      color: theme.text,
      textAlign: "left", // ✅ specifically aligns title text
      fontWeight: 700,
      letterSpacing: "0.3px",
    }}
  >
    {title}
  </Title>
  <Divider mb="sm" />
  <Text
    style={{
      color: theme.text,
      lineHeight: 1.7,
      textAlign: "left", // ✅ aligns paragraph content as well
    }}
  >
    {content}
  </Text>
</Card>
  )

const renderMarkdownCard = (title, content, theme) =>
  content && (
    <Card shadow="sm" radius="lg" p="lg" style={{ background: theme.card, border: theme.cardBorder }}>
      <Title order={4} mb="sm" style={{ color: theme.text }}>
        {title}
      </Title>
      <Divider mb="sm" />
      <MarkdownRenderer content={content} theme={theme} />
    </Card>
  );

const renderImage = (text) => {
  const match = text.match(/!\[.*?\]\((.*?)\)/);
  return match ? <img src={match[1]} alt="Algorithm Visualization" style={{ width: "100%", borderRadius: "10px" }} /> : null;
};

const parseSection = (keyword, text) => {
  const regex = new RegExp(`###\\s*.*${keyword}.*\\n([\\s\\S]*?)(?=###|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const renderCodeExamples = (text, onCopy, copiedBlocks, theme) => {
  const codeBlocks = [...text.matchAll(/```(.*?)\n([\s\S]*?)```/g)];
  if (codeBlocks.length === 0) return null;
  return (
    <Card
      shadow="sm"
      radius="lg"
      p="lg"
      style={{ background: theme.card, border: theme.cardBorder }}
    >
      <Title order={4} mb="sm" style={{ color: theme.text }}>
        Code Examples
      </Title>
      <Divider mb="sm" />
      {codeBlocks.map(([_, lang, code], i) => (
        <Paper key={i} radius="md" mb="md" style={{ overflow: "hidden", border: theme.cardBorder }}>
          <Group position="apart" px="md" py="xs" style={{ background: theme.card }}>
            <Badge color="violet" variant="light" size="sm">
              {lang || "code"}
            </Badge>
            <ActionIcon onClick={() => onCopy(code, i)} variant="light" color={copiedBlocks[i] ? "green" : "gray"} size="sm">
              {copiedBlocks[i] ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Group>
          <Code
            block
            style={{
              background: "#1e293b",
              color: "#e2e8f0",
              padding: "1rem",
              fontSize: "0.875rem",
              fontFamily: "Monaco, Courier New, monospace",
            }}
          >
            {code.trim()}
          </Code>
        </Paper>
      ))}
    </Card>
  );
};

// === Markdown Renderer ===
function MarkdownRenderer({ content, theme }) {
  const renderMarkdown = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("### ")) {
        elements.push(
          <Title key={i} order={4} mt="lg" mb="sm" style={{ color: theme.text }}>
            {line.replace("### ", "")}
          </Title>
        );
      } else if (line.match(/^\d+\. /)) {
        const listItems = [];
        while (i < lines.length && lines[i].match(/^\d+\. /)) {
          listItems.push(
            <Text key={i} component="li" ml="md" my="xs" color={theme.text}>
              {lines[i].replace(/^\d+\. /, "")}
            </Text>
          );
          i++;
        }
        elements.push(
          <ol key={`list-${i}`} style={{ listStyle: "decimal", paddingLeft: "1rem" }}>
            {listItems}
          </ol>
        );
        i--;
      } else if (line.trim()) {
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, `<code style="background:${theme.card};color:${theme.accent};padding:2px 6px;border-radius:4px;">$1</code>`);
        elements.push(
          <Text key={i} my="sm" style={{ color: theme.text, lineHeight: 1.8 }}>
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </Text>
        );
      }
      i++;
    }
    return elements;
  };
  return <div>{renderMarkdown(content)}</div>;
}