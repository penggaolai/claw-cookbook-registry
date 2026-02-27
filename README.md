# 🦞 Claw Cookbook Registry

The official registry of autonomous agent recipes and the CLI to cook them.

## 📦 The CLI (`claw-cookbook`)
The fastest way to install any recipe is using our dedicated CLI tool. No cloning required.

```bash
npx claw-cookbook use [recipe-name]
```

## 🍳 Available Recipes
Browse the `recipes/` folder to see the source code for our community-vetted agents:

- **[Social Growth Agent](./recipes/social-growth)**: Auto-curates niche news from Google News AI Scout RSS feeds (AI, Healthcare, UI) and drafts insightful commentary. Perfect for building authority.

## 👨‍🍳 Do It Yourself (Manual Installation)
If you prefer not to use the CLI, you can set up recipes manually:

1. **Clone the registry**:
   ```bash
   git clone https://github.com/penggaolai/claw-cookbook-registry.git
   ```
2. **Navigate to your chosen recipe**:
   ```bash
   cd recipes/social-growth
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure your environment**:
   Create a `.env` file in the recipe folder with the following variables:
   ```env
   # AI Brain Configuration
   AI_PROVIDER=GEMINI # Options: GEMINI, OPENAI, ANTHROPIC
   GEMINI_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here

   # X (Twitter) API Credentials
   X_API_KEY=your_consumer_key
   X_API_SECRET=your_consumer_secret
   X_ACCESS_TOKEN=your_access_token
   X_ACCESS_TOKEN_SECRET=your_access_token_secret
   ```
5. **Start cooking**:
   ```bash
   npm start
   ```

## 🗺️ Roadmap
We are building the future of autonomous agent distribution. Upcoming features include:
- **Multi-Social Support**: Native adapters for LinkedIn, Mastodon, and Bluesky.
- **OpenClaw Gateway Integration**: Native integration with OpenClaw Gateway for centralized model orchestration and OAuth management.
- **Recipe Marketplace**: Verified premium recipes with secure license key delivery.

## 🤝 How to Contribute
Want to add your own recipe to the cookbook?
1. Fork this repository.
2. Add your agent folder to the `recipes/` directory (ensure it includes a `manifest.json` and `tests/`).
3. Open a Pull Request!

---
Built by [Gaolai](https://github.com/penggaolai) with OpenClaw.
