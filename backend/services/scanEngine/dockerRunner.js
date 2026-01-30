import { spawn } from "node:child_process";

function collectLines(buffer) {
  return buffer
    .toString("utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function runDockerCommand({
  image,
  args,
  timeoutMs,
  cpu = "1",
  memory = "1024m",
}) {
  if (!image) throw new Error("dockerRunner: image is required");
  if (!Array.isArray(args)) throw new Error("dockerRunner: args must be an array");

  const networkMode = process.env.SCAN_DOCKER_NETWORK || "bridge";

  const dockerArgs = [
    "run",
    "--rm",
    "--network",
    networkMode,
    "--cpus",
    cpu,
    "--memory",
    memory,
    "--pids-limit",
    "256",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=256m",
    "--security-opt",
    "no-new-privileges",
    image,
    ...args,
  ];

  const child = spawn("docker", dockerArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  const stdoutChunks = [];
  const stderrChunks = [];

  child.stdout.on("data", (d) => stdoutChunks.push(d));
  child.stderr.on("data", (d) => stderrChunks.push(d));

  const killTimer = timeoutMs
    ? setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {
          // ignore
        }
      }, timeoutMs)
    : null;

  const exitCode = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  }).finally(() => {
    if (killTimer) clearTimeout(killTimer);
  });

  const stdout = Buffer.concat(stdoutChunks);
  const stderr = Buffer.concat(stderrChunks);

  return {
    exitCode,
    stdoutText: stdout.toString("utf8"),
    stderrText: stderr.toString("utf8"),
    stdoutLines: collectLines(stdout),
    stderrLines: collectLines(stderr),
  };
}
