require('dotenv').config();
const Parser = require('rss-parser');
const fetch = require('node-fetch'); // Using node-fetch for RSS fetching

// --- AI Client Setup (Placeholders) ---
// In a real scenario, you'd import and initialize the actual SDKs here.
const getGeminiClient = (apiKey) => {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  console.log("Initializing Gemini client (placeholder)...");
  // Placeholder for Gemini API call
  return {
    synthesize: async (text) => {
      console.log("Gemini: Synthesizing insights for:", text.substring(0, 100) + "...");
      // Simulate AI processing
      return `[Gemini Insight] Key points from the text: ... (simulated)`;
    }
  };
};

const getOpenAIClient = (apiKey) => {
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  console.log("Initializing OpenAI client (placeholder)...");
  // Placeholder for OpenAI API call
  return {
    synthesize: async (text) => {
      console.log("OpenAI: Synthesizing insights for:", text.substring(0, 100) + "...");
      // Simulate AI processing
      return `[OpenAI Insight] Summary of the content: ... (simulated)`;
    }
  };
};

const getAnthropicClient = (apiKey) => {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");
  console.log("Initializing Anthropic client (placeholder)...");
  // Placeholder for Anthropic API call
  return {
    synthesize: async (text) => {
      console.log("Anthropic: Synthesizing insights for:", text.substring(0, 100) + "...");
      // Simulate AI processing
      return `[Anthropic Insight] Core ideas identified: ... (simulated)`;
    }
  };
};

async function initializeAIClient() {
  const aiProvider = process.env.AI_PROVIDER || 'GEMINI';
  let aiClient;

  switch (aiProvider.toUpperCase()) {
    case 'GEMINI':
      aiClient = getGeminiClient(process.env.GEMINI_API_KEY);
      break;
    case 'OPENAI':
      aiClient = getOpenAIClient(process.env.OPENAI_API_KEY);
      break;
    case 'ANTHROPIC':
      aiClient = getAnthropicClient(process.env.ANTHROPIC_API_KEY);
      break;
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${aiProvider}`);
  }
  return aiClient;
}

// --- Main Logic ---
async function synthesizeInsights() {
  console.log("The Insight Synthesizer agent started.");

  let aiClient;
  try {
    aiClient = await initializeAIClient();
  } catch (error) {
    console.error("Failed to initialize AI client:", error.message);
    return; // Exit if AI client fails to initialize
  }

  const rssFeedsString = process.env.RSS_FEEDS;
  if (!rssFeedsString) {
    console.warn("No RSS_FEEDS configured in .env. Exiting.");
    return;
  }
  const rssFeeds = rssFeedsString.split(',').map(feed => feed.trim()).filter(Boolean);

  if (rssFeeds.length === 0) {
    console.warn("No valid RSS_FEEDS found after parsing. Exiting.");
    return;
  }

  const parser = new Parser();

  console.log(`Processing ${rssFeeds.length} RSS feed(s) using ${process.env.AI_PROVIDER} AI...`);

  for (const feedUrl of rssFeeds) {
    try {
      console.log(`Fetching feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      console.log(`Found ${feed.items.length} items in ${feed.title}`);

      for (const item of feed.items) {
        if (item.content || item.summary || item.description) {
          const textToSynthesize = item.content || item.summary || item.description;
          console.log(`Synthesizing insights for "${item.title}"`);
          const insight = await aiClient.synthesize(textToSynthesize);
          console.log(`
--- Insight for "${item.title}" ---
${insight}
`);
        } else {
          console.log(`Skipping "${item.title}" due to no content.`);
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feedUrl}:`, error.message);
    }
  }

  console.log("Insight synthesis complete.");
}

synthesizeInsights();
