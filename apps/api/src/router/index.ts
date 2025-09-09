import { router } from "../trpc";
import { debugRouter } from "./debug";
import { questionRouter } from "./question";
import { reviewRouter } from "./review";
import { reviewAccessRouter } from "./reviewAccess";
import { sectionRouter } from "./section";
import { surveyRouter } from "./survey";
import { threadRouter } from "./thread";

export const appRouter = router({
  survey: surveyRouter,
  section: sectionRouter,
  question: questionRouter,
  thread: threadRouter,
  review: reviewRouter,
  reviewAccess: reviewAccessRouter,
  debug: debugRouter,
});

export type AppRouter = typeof appRouter;
