import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Keep last-known data in memory long enough for the persister to hydrate
        // it back on refresh, so admin-uploaded images don't flash the old copy.
        gcTime: 1000 * 60 * 60 * 24, // 24h
        staleTime: 1000 * 30,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
