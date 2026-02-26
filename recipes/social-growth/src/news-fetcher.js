import Parser from 'rss-parser';
import config from '../config/default.js';

const parser = new Parser();

export const fetchNews = async () => {
  console.log("📰 Fetching news from configured feeds...");
  
  let allItems = [];

  for (const feedUrl of config.feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      // Add source info to each item
      const items = feed.items.map(item => ({
        ...item,
        source: feed.title || 'Unknown Source',
        fetchedAt: new Date()
      }));
      allItems = allItems.concat(items);
    } catch (e) {
      console.error(`❌ Failed to fetch feed ${feedUrl}:`, e.message);
    }
  }

  // Sort by date (newest first)
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Deduplicate by URL
  const seen = new Set();
  const uniqueItems = allItems.filter(item => {
    const duplicate = seen.has(item.link);
    seen.add(item.link);
    return !duplicate;
  });

  console.log(`✅ Found ${uniqueItems.length} unique news items.`);
  return uniqueItems.slice(0, 5); // Return top 5
};
