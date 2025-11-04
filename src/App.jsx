import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "./context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import SortingVisualizer from "./pages/SortingVisualizer";
import LinkedListVisualizer from "./pages/LinkedListVisualizer";
import GraphVisualizer from "./pages/GraphVisualizer";
import TreeVisualizer from "./pages/TreeVisualizer";

function AppContent() {
  const location = useLocation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f9fafb", // fallback background behind gradients
        paddingTop: "3.5rem",
      }}
    >
      {/* ✅ Navbar stays outside animation container */}
      <Navbar />

      {/* ✅ Animated route transitions */}
      <main
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1, // ensures pages appear below navbar
          overflowX: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<SortingVisualizer />} />
              <Route path="/sorting" element={<SortingVisualizer />} />
              <Route path="/linkedlist" element={<LinkedListVisualizer />} />
              <Route path="/graph" element={<GraphVisualizer />} />
              <Route path="/tree" element={<TreeVisualizer />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </MantineProvider>
  );
}