// src/ai/explainGemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("🔍 GEMINI API Key Loaded:", import.meta.env.VITE_GEMINI_API_KEY ? "✅ Yes" : "❌ No");

// 🔹 Initialize Gemini API client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 🔹 Upgraded Prompt Generator for Algorithm Explanations
export default async function explainAlgorithm(algorithmName, codeSnippet = "") {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // latest stable public model
    });

    // 🧠 Rich Prompt: forces structured response
    const prompt = `
You are a **Visual Algorithm Tutor AI**.
Explain the algorithm "${algorithmName}" to a beginner as if teaching visually in an interactive DSA classroom.

Your output must be in **Markdown format**, following this structure clearly:

---

### 🧠 Concept Overview
Explain what the algorithm does in 2–3 lines. Keep it intuitive and beginner-friendly.

### 🧩 Visualization
Describe how it works step-by-step using **images or ASCII visualizations**.
If relevant, embed an example image like:
![](https://upload.wikimedia.org/wikipedia/commons/8/83/Bubblesort-edited-color.svg)
(If it’s another algorithm, use a different relevant image from Wikimedia Commons.)

### ⚙️ Step-by-Step Explanation
Write each step clearly and numerically, showing how data changes over iterations.

### 💻 Code Templates
Provide code in **three languages** — Python, C++, and Java.
Use proper syntax highlighting in fenced Markdown blocks:

\`\`\`python
# Python code here
\`\`\`

\`\`\`cpp
// C++ code here
\`\`\`

\`\`\`java
// Java code here
\`\`\`

Each code block must be a minimal runnable template for this algorithm.

### 🧮 Example Walkthrough
Take a small input (like [5, 1, 4, 2, 8]) and show intermediate states as the algorithm runs.
Use visual array transitions (→ arrows, highlighting swaps).

### 🧠 Time & Space Complexity
Clearly show:
- Best, Average, Worst Time Complexities
- Space Complexity

### 💬 Real-World Analogy
Give a short analogy (e.g., “like sorting playing cards” or “organizing books by height”).

### 🪄 Summary
End with a short 1–2 line recap of when to use this algorithm.

---

Make the explanation **visually appealing, concise, and beginner-friendly**.
DO NOT include meta text like “Here’s the explanation” — only structured Markdown output.
`;

    console.log("⚡ Sending Gemini Prompt for:", algorithmName);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("✅ Gemini Explanation Received");
    return text;
  } catch (error) {
    console.error("❌ Gemini AI failed:", error);
    return "Error: Unable to generate explanation from Gemini AI. Please try again.";
  }
}