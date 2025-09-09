import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const debugRouter = router({
  info: publicProcedure.query(async () => {
    // Get database schema
    const schemaPath = path.join(
      process.cwd(),
      "../../packages/database/prisma/schema.prisma",
    );
    let schemaContent = "";
    try {
      schemaContent = fs.readFileSync(schemaPath, "utf-8");
    } catch (_error) {
      // Try alternative path
      const altPath = path.join(
        process.cwd(),
        "packages/database/prisma/schema.prisma",
      );
      try {
        schemaContent = fs.readFileSync(altPath, "utf-8");
      } catch {
        schemaContent = "Schema file not found";
      }
    }

    // Parse models from schema
    const models = [];
    const modelRegex = /model\s+(\w+)\s*{([^}]*)}/g;
    let match: RegExpExecArray | null = null;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelContent = match[2];
      const fields = [];

      const fieldRegex = /^\s*(\w+)\s+(\w+)(\??)?(.*)$/gm;
      let fieldMatch: RegExpExecArray | null = null;

      while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
        if (!fieldMatch[1].startsWith("@@")) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2],
            optional: !!fieldMatch[3],
            attributes: fieldMatch[4].trim(),
          });
        }
      }

      models.push({ name: modelName, fields });
    }

    // Get API routes
    const routes = [
      {
        path: "survey.list",
        method: "query",
        description: "List all surveys",
      },
      {
        path: "survey.create",
        method: "mutation",
        description: "Create a new survey",
        input: {
          title: "string",
          description: "string?",
        },
      },
      {
        path: "survey.getById",
        method: "query",
        description: "Get survey by ID",
        input: {
          id: "string",
        },
      },
      {
        path: "survey.update",
        method: "mutation",
        description: "Update a survey",
        input: {
          id: "string",
          title: "string?",
          description: "string?",
        },
      },
      {
        path: "survey.delete",
        method: "mutation",
        description: "Delete a survey",
        input: {
          id: "string",
        },
      },
      {
        path: "debug.info",
        method: "query",
        description: "Get debug information",
      },
    ];

    return {
      database: {
        provider: "SQLite",
        models,
      },
      api: {
        baseUrl: process.env.API_URL || "http://localhost:4000",
        routes,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiPort: process.env.PORT || 4000,
      },
    };
  }),

  executeQuery: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only allow SELECT queries for safety
      const normalizedQuery = input.query.trim().toUpperCase();
      if (
        !normalizedQuery.startsWith("SELECT") &&
        !normalizedQuery.startsWith("PRAGMA") &&
        !normalizedQuery.startsWith("EXPLAIN")
      ) {
        throw new Error(
          "Only SELECT, PRAGMA, and EXPLAIN queries are allowed in debug mode",
        );
      }

      try {
        // Execute raw query using Prisma's $queryRawUnsafe
        const result = await ctx.db.$queryRawUnsafe(input.query);

        return {
          success: true,
          result,
          rowCount: Array.isArray(result) ? result.length : 0,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          result: null,
          rowCount: 0,
        };
      }
    }),
});
