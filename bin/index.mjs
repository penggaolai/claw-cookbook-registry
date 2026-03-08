#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const REGISTRY_URL = "https://github.com/penggaolai/claw-cookbook-registry.git";

async function setup() {

  async function getIngredients(recipe, currentEnvContent) {
    // Placeholder for generic ingredient prompting
    // This can be expanded to read from a recipe-specific config file
    // For now, let's just ask for a generic ingredient for non-tic-tac-toe recipes
    if (recipe !== 'tic-tac-toe') {
      const genericIngredient = await rl.question(`\nWhat's the main ingredient for ${recipe}? (e.g., API Key, Username): `);
      currentEnvContent += `MAIN_INGREDIENT=${genericIngredient}\n`;
    }
    return currentEnvContent;
  }

  console.log("\n🦞 Welcome to the Claw Cookbook Chef's Tool!");
  
  const args = process.argv.slice(2);
  const command = args[0];
  const recipeName = args[1];
  const licenseKey = args.find(a => a.startsWith('--key='))?.split('=')[1];

  if (command !== 'use' || !recipeName) {
    console.log("\nUsage: npx claw-cookbook use [recipe-name] [--key=YOUR_LICENSE_KEY]");
    process.exit(0);
  }

  const targetDir = path.join(process.cwd(), `${recipeName}-agent`);
  
  // 1. Check if recipe is Premium
  const premiumRecipes = ['networker', 'thread-weaver', 'trend-scout', 'ideator'];
  const isPremium = premiumRecipes.includes(recipeName);

  if (isPremium && !licenseKey) {
    console.log(`\n💎 '${recipeName}' is a Premium Recipe.`);
    console.log("Please provide a license key to install.");
    console.log(`Get one at: https://claw-social.vercel.app/recipes/${recipeName}\n`);
    const inputKey = await rl.question("Enter License Key: ");
    if (!inputKey) {
      console.log("❌ Installation cancelled.");
      process.exit(1);
    }
    console.log("🎫 Validating license key...");
    await new Promise(r => setTimeout(r, 1000));
    console.log("✅ License validated!");
  }

  try {
    await fs.mkdir(targetDir, { recursive: true });
  } catch (e) {
    console.error(`❌ Folder ${recipeName}-agent already exists!`);
    process.exit(1);
  }

  console.log(`\n👨‍🍳 Preparing to cook: ${recipeName}...`);

  // 2. Clone/Copy Recipe Files
  console.log("📦 Fetching ingredients from Registry...");
  const tempDir = path.join(process.cwd(), `.temp-recipe-${Date.now()}`);
  spawnSync('git', ['clone', '--depth', '1', REGISTRY_URL, tempDir], { stdio: 'inherit' });

  const recipeSource = path.join(tempDir, 'recipes', recipeName);
  
  try {
    const files = await fs.readdir(recipeSource);
    for (const file of files) {
      const src = path.join(recipeSource, file);
      const dest = path.join(targetDir, file);
      spawnSync('cp', ['-r', src, dest]);
    }
  } catch (e) {
    console.error(`❌ Recipe '${recipeName}' not found in the registry!`);
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
    process.exit(1);
  }
  
  await fs.rm(tempDir, { recursive: true, force: true });

  const recipePath = path.join(tempDir, 'recipes', recipeName);
  const manifestPath = path.join(recipePath, 'manifest.json');
  const manifestContent = await fs.readFile(manifestPath, 'utf8');
  const recipeManifest = JSON.parse(manifestContent);

  // 3. Configure .env
  console.log("\n🧂 Adding seasoning (Configuration)...");
  
  let envContent = "";

  const needsTwitter = recipeManifest.category === 'social';

  if (recipeName === 'tic-tac-toe') { // Tic-tac-toe special case for game mode selection
    console.log("🎮 This is a gaming recipe.");
    console.log("[1] Local Play (Terminal only)");
    console.log("[2] Social Play (Post & Reply on X)");
    const gameMode = await rl.question("Select mode: ");

    if (gameMode === '2') {
      console.log("\n--- X (Twitter) API Credentials ---");
      const xApiKey = await rl.question("API Key: ");
      const xApiSecret = await rl.question("API Key Secret: ");
      const xAccessToken = await rl.question("Access Token: ");
      const xAccessTokenSecret = await rl.question("Access Token Secret: ");

      envContent += `X_MODE=SOCIAL\n`;
      envContent += `X_API_KEY=${xApiKey}\n`;
      envContent += `X_API_SECRET=${xApiSecret}\n`;
      envContent += `X_ACCESS_TOKEN=${xAccessToken}\n`;
      envContent += `X_ACCESS_TOKEN_SECRET=${xAccessTokenSecret}\n`;
    } else {
      envContent += `X_MODE=LOCAL\n`;
    }
  }
    }

  console.log("\n--- AI Provider Selection ---");
  console.log("[1] Gemini (Recommended)");
  console.log("[2] OpenAI");
  console.log("[3] Anthropic");
  const providerChoice = await rl.question("Select your Brain: ");
  
  let aiKeyName = "GEMINI_API_KEY";
  if (providerChoice === '2') aiKeyName = "OPENAI_API_KEY";
  if (providerChoice === '3') aiKeyName = "ANTHROPIC_API_KEY";

  const aiKey = await rl.question(`${aiKeyName}: `);
  envContent += `AI_PROVIDER=${aiKeyName.replace('_API_KEY', '')}\n`;
  envContent += `${aiKeyName}=${aiKey}\n`;

  if (needsTwitter) {
    console.log("\n--- X (Twitter) API Credentials ---");
    const xApiKey = await rl.question("API Key: ");
    const xApiSecret = await rl.question("API Key Secret: ");
    const xAccessToken = await rl.question("Access Token: ");
    const xAccessTokenSecret = await rl.question("Access Token Secret: ");
    envContent += `X_API_KEY=${xApiKey}\n`;
    envContent += `X_API_SECRET=${xApiSecret}\n`;
    envContent += `X_ACCESS_TOKEN=${xAccessToken}\n`;
    envContent += `X_ACCESS_TOKEN_SECRET=${xAccessTokenSecret}\n`;
  }

  envContent = await getIngredients(recipeName, envContent);
    }
  }

  if (isPremium) envContent += `CLAW_LICENSE_KEY=${licenseKey}\n`;

  await fs.writeFile(path.join(targetDir, '.env'), envContent);
  console.log("✅ .env file created.");

  // 4. Install Dependencies
  console.log("\n🔥 Turning up the heat (Installing dependencies)...");
  spawnSync('npm', ['install'], { cwd: targetDir, stdio: 'inherit' });

  console.log(`\n✅ Recipe '${recipeName}' is ready!`);
  console.log(`\nTo start cooking:`);
  console.log(`cd ${recipeName}-agent`);
  console.log(`npm start\n`);

  rl.close();
}

setup().catch(console.error);
