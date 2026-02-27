# 🦞 Claw Cookbook Registry

The official registry of autonomous agent recipes and the CLI to cook them.

## 📦 The CLI (`claw-cookbook`)
The fastest way to install any recipe is using our dedicated CLI tool. No cloning required.

```bash
npx claw-cookbook use [recipe-name]
```

## 🍳 Available Recipes
Browse the `recipes/` folder to see the source code for our community-vetted agents:

- **[Social Growth Agent](./recipes/social-growth)**: Auto-curates niche news (AI, Healthcare, UI) and drafts insightful commentary.

## 👨‍🍳 Do It Yourself (Manual Installation)
If you prefer not to use the CLI, you can set up recipes manually:

1. **Clone the registry**:
   ```bash
   git clone https://github.com/penggaolai/claw-cookbook-registry.git
   ```
2. **Navigate to your chosen recipe**:
   ```bash
   cd claw-cookbook-registry/recipes/social-growth
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure your environment**:
   Create a `.env` file based on the requirements in the recipe folder (usually requires X/Twitter and AI API keys).
5. **Start cooking**:
   ```bash
   npm start
   ```

## 🤝 How to Contribute
Want to add your own recipe to the cookbook?
1. Fork this repository.
2. Add your agent folder to the `recipes/` directory (ensure it includes a `manifest.json` and `tests/`).
3. Open a Pull Request!

---
Built by [Gaolai](https://github.com/penggaolai) with OpenClaw.
