#!/usr/bin/env node
/**
 * Build script: clones Vencord (if needed), copies plugin, runs pnpm build.
 * Works on Windows and Linux/macOS.
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const VENCORD_DIR = join(ROOT, "vencord");
const PLUGIN_SOURCE = join(ROOT, "src", "userplugins", "levelThis");
const PLUGIN_DEST = join(VENCORD_DIR, "src", "userplugins", "levelThis");
const VENCORD_REPO = "https://github.com/Vendicated/Vencord.git";

function run(cmd, args = [], cwd = ROOT) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const spawnCmd = isWindows ? "cmd" : cmd;
    const spawnArgs = isWindows ? ["/c", cmd, ...args] : args;
    const child = spawn(spawnCmd, spawnArgs, {
      cwd,
      stdio: "inherit",
      shell: !isWindows,
    });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

function runGit(args, cwd) {
  return run("git", args, cwd);
}

async function ensurePnpm() {
  try {
    await run("npx", ["pnpm", "--version"], ROOT);
    return true;
  } catch {
    console.log("Installing pnpm...");
    await run("npm", ["install", "-g", "pnpm"], ROOT);
    return true;
  }
}

function pnpm(args, cwd = ROOT) {
  return run("npx", ["pnpm", ...args], cwd);
}

async function setup() {
  console.log("Setting up build environment...\n");

  if (!existsSync(PLUGIN_SOURCE)) {
    console.error("Plugin source not found:", PLUGIN_SOURCE);
    process.exit(1);
  }

  if (!existsSync(VENCORD_DIR)) {
    console.log("Cloning Vencord...");
    mkdirSync(VENCORD_DIR, { recursive: true });
    await runGit(["clone", "--depth", "1", VENCORD_REPO, VENCORD_DIR]);
    console.log("Vencord cloned.\n");
  } else {
    console.log("Vencord directory exists, skipping clone.\n");
  }

  const oldLevelItDir = join(VENCORD_DIR, "src", "userplugins", "levelIt");
  if (existsSync(oldLevelItDir)) {
    console.log("Removing old levelIt plugin...");
    rmSync(oldLevelItDir, { recursive: true });
  }

  console.log("Copying Level This plugin...");
  mkdirSync(dirname(PLUGIN_DEST), { recursive: true });
  if (existsSync(PLUGIN_DEST)) rmSync(PLUGIN_DEST, { recursive: true });
  cpSync(PLUGIN_SOURCE, PLUGIN_DEST, { recursive: true });
  console.log("Plugin copied.\n");

  await ensurePnpm();
  console.log("Installing Vencord dependencies...");
  await pnpm(["install"], VENCORD_DIR);
  console.log("Setup complete.\n");
}

async function build() {
  if (!existsSync(VENCORD_DIR)) {
    console.log("Vencord not found. Running setup first...\n");
    await setup();
  }

  const oldLevelItDir = join(VENCORD_DIR, "src", "userplugins", "levelIt");
  if (existsSync(oldLevelItDir)) {
    console.log("Removing old levelIt plugin...");
    rmSync(oldLevelItDir, { recursive: true });
  }

  // Always copy plugin so changes in src/userplugins/levelThis are picked up
  console.log("Copying Level This plugin...");
  mkdirSync(dirname(PLUGIN_DEST), { recursive: true });
  if (existsSync(PLUGIN_DEST)) rmSync(PLUGIN_DEST, { recursive: true });
  cpSync(PLUGIN_SOURCE, PLUGIN_DEST, { recursive: true });

  // Patch PluginModal so LevelThis can supply a custom author avatar (modal lives in our bundle, so runtime patches never run)
  const pluginModalPath = join(VENCORD_DIR, "src", "components", "settings", "tabs", "plugins", "PluginModal.tsx");
  if (existsSync(pluginModalPath)) {
    let modalCode = readFileSync(pluginModalPath, "utf-8");
    const needle = "src={user.getAvatarURL(void 0, 80, true)}";
    const replacement = "src={plugin.name === \"LevelThis\" && typeof (window as any).__LEVELTHIS_AUTHOR_AVATAR__ === \"string\" ? (window as any).__LEVELTHIS_AUTHOR_AVATAR__ : user.getAvatarURL(void 0, 80, true)}";
    if (modalCode.includes(needle)) {
      modalCode = modalCode.replace(needle, replacement);
      writeFileSync(pluginModalPath, modalCode);
      console.log("Patched PluginModal for LevelThis author avatar.");
    }
  }

  await ensurePnpm();
  // Vencord only has "build" (no build:dev); both use same build
  console.log("Running pnpm run build in vencord...\n");
  await pnpm(["run", "build"], VENCORD_DIR);
  console.log("\nBuild complete. Output in vencord/dist/");
}

async function watch() {
  if (!existsSync(VENCORD_DIR)) {
    console.log("Vencord not found. Running setup first...\n");
    await setup();
  }
  if (!existsSync(PLUGIN_DEST)) {
    console.log("Plugin not in Vencord. Copying...");
    mkdirSync(dirname(PLUGIN_DEST), { recursive: true });
    cpSync(PLUGIN_SOURCE, PLUGIN_DEST, { recursive: true });
  }
  await ensurePnpm();
  console.log("Running pnpm run watch in vencord (will keep running)...\n");
  await pnpm(["run", "watch"], VENCORD_DIR);
}

function clean() {
  if (existsSync(VENCORD_DIR)) {
    console.log("Removing vencord directory...");
    rmSync(VENCORD_DIR, { recursive: true });
    console.log("Done.");
  } else {
    console.log("No vencord directory to clean.");
  }
}

const command = process.argv[2];

switch (command) {
  case "setup":
    setup().catch((e) => {
      console.error(e);
      process.exit(1);
    });
    break;
  case "build":
    build().catch((e) => {
      console.error(e);
      process.exit(1);
    });
    break;
  case "clean":
    clean();
    break;
  case "watch":
    watch().catch((e) => {
      console.error(e);
      process.exit(1);
    });
    break;
  default:
    console.log(`
Usage: node scripts/build.mjs <command>

Commands:
  setup     Clone Vencord, copy plugin, install dependencies
  build     Run setup if needed, then build Vencord
  watch     Run build in watch mode (stays running, rebuilds on changes)
  clean     Remove vencord directory

Examples:
  node scripts/build.mjs setup
  node scripts/build.mjs build
  node scripts/build.mjs watch
  node scripts/build.mjs clean
`);
    process.exit(command ? 1 : 0);
}
