import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean | undefined;
};

function initializeDatabase() {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";
  const isCloudRun = process.env.K_SERVICE !== undefined; // Cloud Run detection

  // Cloud Run環境でのデータベース初期化
  if (isProduction && isCloudRun && !globalForPrisma.dbInitialized) {
    const tmpDbPath = "/tmp/dev.db";
    const sourceDbPath = join(process.cwd(), "packages", "database", "prisma", "dev.db");

    try {
      console.log("Cloud Run environment detected, initializing database...");
      console.log("Source DB path:", sourceDbPath);
      console.log("Target DB path:", tmpDbPath);
      console.log("Current working directory:", process.cwd());
      console.log("Directory contents:", require('fs').readdirSync(process.cwd()));

      if (!existsSync(tmpDbPath)) {
        if (existsSync(sourceDbPath)) {
          console.log("Copying database from source to /tmp...");
          const dbContent = readFileSync(sourceDbPath);
          writeFileSync(tmpDbPath, dbContent);
          console.log("Database copied successfully to /tmp");
        } else {
          console.error("Source database file not found at:", sourceDbPath);
          // 代替パスを試行
          const altPaths = [
            join(process.cwd(), "dev.db"),
            join(process.cwd(), "packages", "database", "prisma", "dev.db"),
            "/usr/src/app/packages/database/prisma/dev.db"
          ];
          
          for (const altPath of altPaths) {
            console.log("Trying alternative path:", altPath);
            if (existsSync(altPath)) {
              console.log("Found database at alternative path:", altPath);
              const dbContent = readFileSync(altPath);
              writeFileSync(tmpDbPath, dbContent);
              console.log("Database copied successfully to /tmp from alternative path");
              break;
            }
          }
        }
      } else {
        console.log("Database already exists in /tmp");
      }

      globalForPrisma.dbInitialized = true;
    } catch (error) {
      console.error("Cloud Run database initialization error:", error);
    }
  }

  // Vercel環境でのデータベース初期化（一度だけ実行）
  if (isProduction && isVercel && !globalForPrisma.dbInitialized) {
    const tmpDbPath = "/tmp/deploy.db";

    try {
      // publicディレクトリからDBをコピー
      if (!existsSync(tmpDbPath)) {
        // Next.jsのpublicディレクトリからDBファイルを取得
        const publicDbPath = join(process.cwd(), "public", "deploy.db");

        if (existsSync(publicDbPath)) {
          console.log("Copying database from public directory to /tmp...");
          const dbContent = readFileSync(publicDbPath);
          writeFileSync(tmpDbPath, dbContent);
          console.log("Database copied successfully");
        } else {
          console.warn("Database file not found in public directory");
        }
      }

      globalForPrisma.dbInitialized = true;
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  // Determine database URL
  let databaseUrl: string;
  
  if (isProduction && isCloudRun) {
    databaseUrl = "file:/tmp/dev.db";
  } else if (isProduction && isVercel) {
    databaseUrl = "file:/tmp/deploy.db";
  } else if (process.env.DATABASE_URL) {
    databaseUrl = process.env.DATABASE_URL;
  } else {
    // Fallback for build time when DATABASE_URL might not be set
    const candidates = [
      join(process.cwd(), "packages", "database", "prisma", "dev.db"),
      join(process.cwd(), "..", "packages", "database", "prisma", "dev.db"),
      join(process.cwd(), "..", "..", "packages", "database", "prisma", "dev.db"),
      join(__dirname, "..", "prisma", "dev.db"),
    ];
    const found = candidates.find((p) => existsSync(p));
    const absLocalDbPath = found ?? join(__dirname, "..", "prisma", "dev.db");
    databaseUrl = `file:${absLocalDbPath}`;
  }

  return new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? initializeDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export * from "@prisma/client";