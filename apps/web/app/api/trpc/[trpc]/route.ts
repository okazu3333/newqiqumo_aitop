import { appRouter } from "@survey-poc/api/src/router";
import { getPrisma } from "@/lib/db";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req as any,
    res: opts.resHeaders as any,
    db: getPrisma(),
  };
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
