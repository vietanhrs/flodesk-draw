/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";

import { Navigate, createBrowserRouter } from "react-router-dom";

import { SuspenseRoute } from "@src/shared";

const Templates = lazy(() =>
  import("./pages/Templates").then((m) => ({ default: m.Templates }))
);

const Editor = lazy(() =>
  import("./pages/Editor").then((m) => ({ default: m.Editor }))
);

export const router = createBrowserRouter([
  {
    path: "/",
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
]);
