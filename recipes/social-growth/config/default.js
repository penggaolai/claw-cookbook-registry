// User Configuration
export default {
  // Your Twitter/X API credentials (from developer.x.com)
  twitter: {
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  },

  // Target User Persona (Customize this!)
  persona: {
    role: "Lead UI Engineer", // e.g. "SaaS Founder", "Crypto Analyst"
    topics: ["OpenClaw Framework", "AI Agents & Automation", "LLM Orchestration (LangChain/LangGraph)"],
    tone: "Professional, Insightful, Builder-Focused", // e.g. "Casual", "Meme-focused"
    avoid: ["Political hot takes", "Low-effort generic praise", "Crypto shilling"],
  },

  // Engagement Targets (People to reply to)
  targets: [
    "steipete",    // OpenClaw Creator
    "hwchase17",   // LangChain
    "swyx",        // AI Engineering
    "Mappletons",  // Agent UX
  ],

  // Content Sources (RSS feeds for news briefing)
  feeds: [
    "https://news.google.com/rss/search?q=OpenClaw+AI+Agent&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=AI+Agents+Framework+LangChain&hl=en-US&gl=US&ceid=US:en",
  ],
};
