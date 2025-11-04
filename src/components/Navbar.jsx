import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Group, Text, Card } from "@mantine/core";
import { motion } from "framer-motion";
import { IconBinaryTree2} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");

  // Scroll behavior
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down
        setVisible(false);
      } else {
        // Scrolling up
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Dynamic theme per page
  const getAccent = () => {
    if (path === "/" || path.includes("sort")) {
      return { color: "#06b6d4", gradient: "linear-gradient(90deg, #06b6d4, #3b82f6)" };
    }
    if (path.includes("linked")) {
      return { color: "#6366f1", gradient: "linear-gradient(90deg, #6366f1, #8b5cf6)" };
    }
    if (path.includes("graph")) {
      return { color: "#10b981", gradient: "linear-gradient(90deg, #059669, #10b981)" };
    }
    if (path.includes("tree")) {
      return { color: "#8b5cf6", gradient: "linear-gradient(90deg, #8b5cf6, #a855f7)" };
    }
    return { color: "#06b6d4", gradient: "linear-gradient(90deg, #06b6d4, #3b82f6)" };
  };

  const { color: accent, gradient } = getAccent();

  const navLinks = [
    { label: "Sorting", to: "/", shortLabel: "Sort" },
    { label: "Linked List", to: "/linkedlist", shortLabel: "List" },
    { label: "Graphs", to: "/graph", shortLabel: "Graph" },
    { label: "Trees", to: "/tree", shortLabel: "Tree" },
  ];

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999,
      }}
    >
      <Card
        shadow="sm"
        padding={isSmallMobile ? "xs" : isMobile ? "sm" : "md"}
        radius={0}
        style={{
          backgroundColor: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.3s ease",
          height: isSmallMobile ? "56px" : isMobile ? "64px" : "72px",
        }}
      >
        <Group
          position="apart"
          align="center"
          style={{
            flexWrap: isSmallMobile ? "wrap" : "nowrap",
            gap: isSmallMobile ? "0.5rem" : isMobile ? "0.75rem" : "1.25rem",
          }}
        >
          {/* Left: Logo */}
          <Group
            spacing={isSmallMobile ? 6 : 12}
            align="center"
            style={{
              flexShrink: 0,
              marginRight: isMobile ? "0.5rem" : "1.5rem",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: isSmallMobile ? "6px" : "10px",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = "scale(1)")}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <IconBinaryTree2
                  size={isSmallMobile ? 26 : isMobile ? 30 : 36}
                  color={accent}
                  stroke={2.2}
                  style={{
                    filter: `drop-shadow(0 2px 4px ${accent}50)`,
                    transition: "all 0.3s ease",
                  }}
                />
              </motion.div>

              <Text
                fw={700}
                size={isMobile ? "md" : "lg"}
                style={{
                  backgroundImage: gradient,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                VisuAlgo.AI
              </Text>
            </Link>
          </Group>

          {/* Right: Nav Links */}
          <Group
            spacing={isSmallMobile ? "xs" : isMobile ? "sm" : isTablet ? "md" : "xl"}
            style={{
              flexWrap: "nowrap",
              justifyContent: isMobile ? "flex-end" : "center",
              width: "auto",
            }}
          >
            {navLinks.map((link) => {
              const isActive =
                (link.to === "/" && (path === "/" || path.includes("sort"))) ||
                (link.to !== "/" && path.includes(link.to.replace("/", "")));

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    position: "relative",
                    textDecoration: "none",
                    color: isActive ? accent : "#475569",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: isSmallMobile
                      ? "0.75rem"
                      : isMobile
                      ? "0.85rem"
                      : isTablet
                      ? "0.9rem"
                      : "1rem",
                    transition: "all 0.3s ease",
                    padding: isSmallMobile ? "2px 4px" : "4px 8px",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isSmallMobile ? link.shortLabel : link.label}

                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      style={{
                        position: "absolute",
                        left: 0,
                        bottom: isSmallMobile ? -3 : -4,
                        width: "100%",
                        height: isSmallMobile ? "2px" : "3px",
                        backgroundColor: accent,
                        borderRadius: "2px",
                        boxShadow: `0 0 8px ${accent}60`,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </Group>
        </Group>
      </Card>
    </motion.div>
  );
}