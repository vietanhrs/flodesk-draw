/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";

import {
  Navigate,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
  type RouteObject,
} from "react-router-dom";

import { ErrorBoundary, SuspenseRoute } from "@src/shared";

const Templates = lazy(() =>
  import("./pages/Templates").then((m) => ({ default: m.Templates }))
);

const Editor = lazy(() =>
  import("./pages/Editor").then((m) => ({ default: m.Editor }))
);

const routeErrorToError = (routeError: unknown) => {
  if (routeError instanceof Error) {
    return routeError;
  }

  if (isRouteErrorResponse(routeError)) {
    return new Error(
      routeError.statusText || `Route error ${routeError.status}`
    );
  }

  return new Error("Unknown route error");
};

const AppRouteErrorBoundary = () => (
  <ErrorBoundary error={routeErrorToError(useRouteError())} />
);

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    errorElement: <AppRouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="templates" replace />,
      },
      {
        path: "templates",
        element: (
          <SuspenseRoute>
            <Templates />
          </SuspenseRoute>
        ),
      },
      {
        path: "templates/:templateId",
        element: (
          <SuspenseRoute>
            <Editor />
          </SuspenseRoute>
        ),
      },
      {
        path: "editor",
        element: (
          <SuspenseRoute>
            <Editor />
          </SuspenseRoute>
        ),
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
