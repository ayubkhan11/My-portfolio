import express from "express";
import path from "path";
import dotenv from "dotenv";
import chatbotRoutes from "./routes/chatbot.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const __dirname = path.resolve();

// ✅ Debug: Check if API key is loaded
console.log("=== Environment Check ===");
console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
console.log("GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length || 0);
console.log("GROQ_API_KEY starts with 'gsk_':", process.env.GROQ_API_KEY?.startsWith('gsk_') || false);
console.log("========================");

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Chatbot API Route
app.use("/api/chatbot", chatbotRoutes);

// Fallback route (fixes "Cannot GET /about" on refresh)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, "public")}`);
});