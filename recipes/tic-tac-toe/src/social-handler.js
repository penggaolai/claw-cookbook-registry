import { initClient } from '../index.js';

export const parseMove = (text) => {
  const normalized = text.toLowerCase();
  
  if (normalized.includes("top left") || normalized.includes("0")) return 0;
  if (normalized.includes("top center") || normalized.includes("1")) return 1;
  if (normalized.includes("top right") || normalized.includes("2")) return 2;
  if (normalized.includes("middle left") || normalized.includes("3")) return 3;
  if (normalized.includes("center") || normalized.includes("4")) return 4;
  if (normalized.includes("middle right") || normalized.includes("5")) return 5;
  if (normalized.includes("bottom left") || normalized.includes("6")) return 6;
  if (normalized.includes("bottom center") || normalized.includes("7")) return 7;
  if (normalized.includes("bottom right") || normalized.includes("8")) return 8;
  
  return null;
};

export const replyWithBoard = async (tweetId, userHandle, game) => {
  const client = initClient();
  const board = game.renderBoard();
  const text = `@${userHandle} Great move! Here is my counter-play: \n\n${board}\nYour turn! #ClawCookbook`;
  
  try {
    const resp = await client.v2.tweet(text, { reply: { in_reply_to_tweet_id: tweetId } });
    console.log(`✅ Replied to @${userHandle}`);
    return resp.data.id;
  } catch (err) {
    console.error("❌ Failed to reply on X:", err.message);
    return null;
  }
};
