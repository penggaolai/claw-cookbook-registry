#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setup() {
  console.log("\n🦞 Welcome to the Claw Cookbook Chef's Tool!");
  
  const args = process.argv.slice(2);
  const command = args[0];
  const recipeName = args[1];

  if (command !== 'use' || !recipeName) {
    console.log("\nUsage: npx claw-cookbook use [recipe-name]");
    console.log("Example: npx claw-cookbook use social-growth\n");
    process.exit(0);
  }

  const targetDir = path.join(process.cwd(), `${recipeName}-agent`);
  
  // 1. Create target directory
  try {
    await fs.mkdir(targetDir, { recursive: true });
  } catch (e) {
    console.error(`❌ Folder ${recipeName}-agent already exists!`);
    process.exit(1);
  }

  console.log(`\n👨‍🍳 Preparing to cook: ${recipeName}...`);

  // 2. Clone/Copy Recipe Files
  console.log("📦 Fetching ingredients from GitHub...");
  const repoUrl = "https://github.com/penggaolai/claw-social.git";
  
  const tempDir = path.join(process.cwd(), `.temp-recipe-${Date.now()}`);
  const gitClone = spawnSync('git', ['clone', '--depth', '1', repoUrl, tempDir], { stdio: 'inherit' });

  if (gitClone.status !== 0) {
    console.error("❌ Failed to clone repository.");
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
    console.error(`❌ Recipe '${recipeName}' not found in the cookbook!`);
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(targetDir, { recursive: true, force: true });
    process.exit(1);
  }
  
  await fs.rm(tempDir, { recursive: true, force: true });

  // 3. Configure .env
  console.log("\n🧂 Adding seasoning (Configuration)...");
  
  // Explicitly prompt and wait
  const xKey = await rl.question("Enter your X (Twitter) API Key: ");
  const aiKey = await rl.question("Enter your AI Provider API Key (e.g. Gemini/OpenAI): ");

  const envContent = `X_API_KEY=${xKey}\nAI_API_KEY=${aiKey}\n`;
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
