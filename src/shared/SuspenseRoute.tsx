import type { ReactNode } from "react";
import { Suspense } from "react";

import { ErrorBoundary } from "./ErrorBoundary";

export const SuspenseRoute = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={null}>{children}</Suspense>
  </ErrorBoundary>
);
