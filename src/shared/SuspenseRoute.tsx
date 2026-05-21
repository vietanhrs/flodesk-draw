import type { ReactNode } from "react";
import { Suspense } from "react";

import { ErrorBoundary } from "./ErrorBoundary";
import { RouteFallback } from "./RouteFallback";

export const SuspenseRoute = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteFallback />}>{children}</Suspense>
  </ErrorBoundary>
);
