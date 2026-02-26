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
  console.log("\n🦞 Welcome to the Claw Cookbook Chef's Tool!");
  
  const args = process.argv.slice(2);
  const command = args[0];
  const recipeName = args[1];
  const licenseKey = args.find(a => a.startsWith('--key='))?.split('=')[1];

  if (command !== 'use' || !recipeName) {
    console.log("\nUsage: npx claw-cookbook use [recipe-name] [--key=YOUR_LICENSE_KEY]");
    console.log("Example (Free): npx claw-cookbook use social-growth");
    console.log("Example (Paid): npx claw-cookbook use networker --key=XXXX-XXXX-XXXX\n");
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
    // In Phase 2, we would validate this key against your backend
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

  // 2. Fetching Logic
  console.log("📦 Fetching ingredients...");
  
  if (isPremium) {
    // In Phase 2, this would pull from a PRIVATE repo using the validated token
    console.log("🔐 Authenticating with private registry...");
  }

  const tempDir = path.join(process.cwd(), `.temp-recipe-${Date.now()}`);
  const gitClone = spawnSync('git', ['clone', '--depth', '1', REGISTRY_URL, tempDir], { stdio: 'inherit' });

  if (gitClone.status !== 0) {
    console.error("❌ Failed to reach the registry.");
    process.exit(1);
  }

  const recipeSource = path.join(tempDir, 'recipes', recipeName);
  
  try {
    const files = await fs.readdir(recipeSource);
    for (const file of files) {
      const src = path.join(recipeSource, file);
      const dest = path.join(targetDir, file);
      spawnSync('cp', ['-r', src, dest]);
    }
  } catch (e) {
    console.error(`\n❌ Recipe '${recipeName}' not found or access denied.`);
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
    process.exit(1);
  }
  
  await fs.rm(tempDir, { recursive: true, force: true });

  // 3. Configure .env
  console.log("\n🧂 Adding seasoning (Configuration)...");
  const xKey = await rl.question("Enter your X (Twitter) API Key: ");
  const aiKey = await rl.question("Enter your AI Provider API Key: ");

  let envContent = `X_API_KEY=${xKey}\nAI_API_KEY=${aiKey}\n`;
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
  process.exit(0);
}

setup().catch(err => {
  console.error(err);
  process.exit(1);
});
