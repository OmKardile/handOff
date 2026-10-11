#!/usr/bin/env node
import { spawn } from "node:child_process";

process.env.NEXT_TELEMETRY_DISABLED = "1";

const rawArgs = process.argv.slice(2);
const filteredArgs = [];
for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === "--host") {
    filteredArgs.push("-H", rawArgs[++i] || "0.0.0.0");
  } else if (rawArgs[i].startsWith("--host=")) {
    filteredArgs.push("-H", rawArgs[i].split("=")[1]);
  } else {
    filteredArgs.push(rawArgs[i]);
  }
}

if (!filteredArgs.includes("-p") && !filteredArgs.includes("--port")) {
  filteredArgs.push("-p", "3000");
}

const child = spawn("npx", ["next", "dev", ...filteredArgs], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
