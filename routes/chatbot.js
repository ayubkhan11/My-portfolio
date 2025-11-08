import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const router = express.Router();

// Portfolio Data
const portfolioData = {
  name: "Ayub Khan J",
  title: "Junior App Developer | Flutter & Dart Specialist",
  contact: {
    phone: "+91 7904463409",
    email: "kayub1601@gmail.com"
  },
  skills: [
    "Flutter", "Dart", "Next.js", "Python", "HTML", "CSS",
    "Postman", "Android Studio", "Xcode", "Firebase", "Git"
  ],
  projects: [
    {
      name: "GPRS",
      description: "Service booking app for home appliances with call masking for secure communication.",
      tech: ["Flutter", "Dart", "Postman"]
    },
    {
      name: "Pilling",
      description: "Construction management app with task tracking and SOS quick-call feature.",
      tech: ["Flutter", "Dart", "Android Studio"]
    },
    {
      name: "Flicky",
      description: "Short-form video sharing app with advanced media features like trimming and audio merging.",
      tech: ["Flutter", "Dart", "Postman"]
    },
    {
      name: "Hi-Tech Constructions Website",
      description: "Responsive website for construction company showcasing services and projects.",
      tech: ["HTML", "CSS"]
    },
    {
      name: "WhatsApp Automation",
      description: "Python automation tool for bulk WhatsApp messages using Selenium.",
      tech: ["Python", "Selenium", "ChromeDriver"]
    }
  ],
  experience: [
    { company: "Codegen Solutions", role: "Junior App Developer", period: "June 2024 – Present" },
    { company: "Coderzbot Technology", role: "Junior App Developer", period: "April 2023 – May 2024" }
  ],
  education: [
    { degree: "B.Sc Computer Science", cgpa: "7.2 CGPA", institution: "Periyar University" },
    { degree: "XII", percent: "62%", institution: "Govt Boys Higher Secondary" },
    { degree: "X", percent: "80%", institution: "Govt Boys Higher Secondary School" }
  ]
};

// System prompt
const systemPrompt = `You are an AI assistant for Ayub Khan J's portfolio. Provide helpful, friendly, and concise responses (2-3 sentences max).

PORTFOLIO INFO:
Name: ${portfolioData.name}
Role: ${portfolioData.title}
Phone: ${portfolioData.contact.phone}
Email: ${portfolioData.contact.email}

Skills: ${portfolioData.skills.join(", ")}

Projects:
${portfolioData.projects.map(p => `- ${p.name}: ${p.description} (Tech: ${p.tech.join(", ")})`).join("\n")}

Experience:
${portfolioData.experience.map(e => `- ${e.company} as ${e.role} (${e.period})`).join("\n")}

Education:
${portfolioData.education.map(e => `- ${e.degree} ${e.cgpa || e.percent} from ${e.institution}`).join("\n")}

Keep responses brief and helpful. For detailed inquiries, suggest contacting via email or phone.`;

// Initialize AI Model with correct model name
const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile", // ✅ Valid GROQ model
  temperature: 0.3,
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY,
});

// Chat history storage
const chatHistories = new Map();

// AI Processing Function
const processChat = async (message, sessionId = "default") => {
  try {
    if (!chatHistories.has(sessionId)) {
      chatHistories.set(sessionId, [new SystemMessage(systemPrompt)]);
    }

    const history = chatHistories.get(sessionId);
    history.push(new HumanMessage(message));

    const response = await llm.invoke(history);
    history.push(response);

    // Keep last 20 messages + system message
    if (history.length > 21) {
      const systemMsg = history[0];
      const recentHistory = history.slice(-20);
      chatHistories.set(sessionId, [systemMsg, ...recentHistory]);
    }

    return response.content;
  } catch (error) {
    console.error("AI Processing Error:", error);
    throw error;
  }
};

// Chat API Endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;
    
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Valid message is required" 
      });
    }

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: "API key not configured. Please set GROQ_API_KEY in .env file" 
      });
    }

    const reply = await processChat(message.trim(), sessionId);
    
    res.json({ 
      success: true, 
      response: reply, 
      sessionId 
    });
  } catch (error) {
    console.error("Chat Endpoint Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "I'm having trouble responding right now. Please try again." 
    });
  }
});

// Health Check
router.get("/status", (req, res) => {
  res.json({
    service: "Ayub Khan Portfolio Chatbot",
    status: "operational",
    version: "1.0.0",
    activeSessions: chatHistories.size,
    apiConfigured: !!process.env.GROQ_API_KEY
  });
});

// Clear chat history
router.post("/clear-history", (req, res) => {
  const { sessionId = "default" } = req.body;
  if (chatHistories.has(sessionId)) {
    chatHistories.delete(sessionId);
    res.json({ success: true, message: "Chat history cleared", sessionId });
  } else {
    res.json({ success: false, message: "No chat history found", sessionId });
  }
});

export default router;