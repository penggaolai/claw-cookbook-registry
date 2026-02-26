import { initClient, createDraft } from './twitter-utils.js';
import { fetchNews } from './news-fetcher.js';
import config from '../config/default.js';
import { PERSONA_PROMPT } from '../prompts/persona.js';
import fs from 'fs/promises';

// --- Configuration ---
const TWITTER_ENABLED = true; // Set to false to disable posting (Dry Run)

// --- Helper: Format News for Agent ---
const formatNewsForPrompt = (items) => {
  return items.map((item, i) => `
  [${i + 1}] Title: ${item.title}
  Source: ${item.source}
  Summary: ${item.contentSnippet || item.summary || 'No summary'}
  Link: ${item.link}
  `).join('\n');
};

// --- Helper: Generate Insight (Simulated LLM) ---
// In a real OpenClaw agent, this would call the LLM model.
// For this script, we use a template-based heuristic to show the structure.
const generateInsight = async (item, persona) => {
  // Identify topic
  const isHealthcare = /medic|health|doctor|patient|surger|clinic|biol/i.test(item.title + item.summary);
  const isCoding = /code|programm|dev|engineer|software|python|javascript/i.test(item.title + item.summary);
  
  // Choose hook
  let hook = "";
  let tags = "";
  
  if (isHealthcare) {
    hook = "🏥 Healthcare AI Watch:";
    tags = "#AI #HealthTech";
  } else if (isCoding) {
    hook = "👨‍💻 Dev Perspective:";
    tags = "#AI #Dev";
  } else {
    hook = "🤖 AI Update:";
    tags = "#AI #Tech";
  }

  // Construct draft
  // Heuristic: Use summary if available, otherwise title.
  const content = (item.contentSnippet && item.contentSnippet.length > item.title.length) 
    ? item.contentSnippet 
    : item.title;
    
  // Truncate
  const maxLen = 200;
  const safeContent = content.length > maxLen ? content.substring(0, maxLen) + "..." : content;

  // The "Insight" placeholder encourages the user to add value
  const insight = "[Your expert take here]"; 

  return `${hook} ${safeContent}\n\nMy take: ${insight}\n\n🔗 ${item.link} ${tags}`;
};

// --- Main Agent Loop ---
export const runAgent = async () => {
  console.log("🦞 Claw Social Agent Starting...");
  console.log(`👤 Persona: ${config.persona.role} (${config.persona.tone})`);

  // 1. Fetch News
  const newsItems = await fetchNews();
  
  if (newsItems.length === 0) {
    console.log("⚠️ No news found today.");
    return;
  }

  // 2. Select Best Item (Heuristic: First item not yet drafted)
  // Check against history file
  let draftedUrls = [];
  try {
    const data = await fs.readFile('.draft_history.json', 'utf-8');
    draftedUrls = JSON.parse(data);
  } catch (e) {
    draftedUrls = [];
  }

  const freshItems = newsItems.filter(item => !draftedUrls.includes(item.link));

  if (freshItems.length === 0) {
    console.log("✅ All news items already drafted.");
    return;
  }

  const topItem = freshItems[0];
  console.log(`🎯 Selecting top story: "${topItem.title}"`);

  // 3. Draft Tweet
  const draftContent = await generateInsight(topItem, config.persona);
  
  // 4. Create Draft File (Queue)
  const draft = await createDraft('tweet', draftContent);

  // 5. Update History
  draftedUrls.push(topItem.link);
  // Keep history manageable
  if (draftedUrls.length > 50) draftedUrls.shift();
  await fs.writeFile('.draft_history.json', JSON.stringify(draftedUrls, null, 2));

  console.log("✅ Draft saved to .draft_tweet.json");
  return draft;
};
