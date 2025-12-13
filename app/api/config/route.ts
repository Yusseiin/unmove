import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { AppConfig } from "@/types/config";
import { defaultConfig } from "@/types/config";

// Config file path - can be set via CONFIG_PATH env variable, defaults to project root
function getConfigPath(): string {
  const envPath = process.env.CONFIG_PATH;
  if (envPath) {
    // If it's a directory, append the filename
    if (!envPath.endsWith(".json")) {
      return path.join(envPath, "unmove-config.json");
    }
    return envPath;
  }
  return path.join(process.cwd(), "unmove-config.json");
}

async function readConfig(): Promise<AppConfig> {
  try {
    const configPath = getConfigPath();
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content) as Partial<AppConfig>;
    // Merge with defaults to ensure all fields exist
    return { ...defaultConfig, ...config };
  } catch {
    // File doesn't exist or invalid, return defaults
    return defaultConfig;
  }
}

async function writeConfig(config: AppConfig): Promise<void> {
  const configPath = getConfigPath();
  // Ensure directory exists
  const dir = path.dirname(configPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

// GET - Read current config
export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Failed to read config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read configuration" },
      { status: 500 }
    );
  }
}

// POST - Update config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentConfig = await readConfig();

    // Merge new values with existing config
    const newConfig: AppConfig = {
      ...currentConfig,
      ...body,
    };

    // Validate language
    if (newConfig.language !== "en" && newConfig.language !== "it") {
      return NextResponse.json(
        { success: false, error: "Invalid language. Must be 'en' or 'it'" },
        { status: 400 }
      );
    }

    await writeConfig(newConfig);

    return NextResponse.json({ success: true, data: newConfig });
  } catch (error) {
    console.error("Failed to save config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}
