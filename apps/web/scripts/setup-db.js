import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("Setting up database for production...");

// Ensure the database directory exists
const dbPath = join(__dirname, "../../../packages/database/prisma/dev.db");
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

try {
  // Change to database package directory
  const databaseDir = join(__dirname, "../../../packages/database");

  // Generate Prisma Client
  console.log("Generating Prisma Client...");
  execSync("npx prisma generate", {
    cwd: databaseDir,
    stdio: "inherit",
  });

  // Push schema to database (creates tables)
  console.log("Creating database schema...");
  execSync("npx prisma db push --skip-generate", {
    cwd: databaseDir,
    stdio: "inherit",
  });

  console.log("Database setup completed successfully!");
} catch (error) {
  console.error("Failed to setup database:", error);
  process.exit(1);
}
