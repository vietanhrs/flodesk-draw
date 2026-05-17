/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from "react";

import { GrainProvider } from "@flodesk/grain";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location" data-pathname={location.pathname}>
      {`${location.pathname}${location.search}`}
    </div>
  );
};

/**
 * Mount `ui` at `routePath` inside a fresh MemoryRouter, with a sibling
 * LocationDisplay that mirrors the current location into the DOM as
 * `[data-testid="location"]` so tests can assert navigation.
 */
export const renderAtPath = (
  ui: ReactElement,
  routePath: string,
  initialPath = routePath
) => {
  return render(
    <GrainProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <LocationDisplay />
        <Routes>
          <Route path={routePath} element={ui} />
          {/* Catch-all so navigations triggered by the unit under test
              (e.g. /editor, /templates/:id) don't emit "No routes matched"
              warnings — we only care that the location updated, which
              LocationDisplay surfaces for assertions. */}
          <Route path="*" element={null} />
        </Routes>
      </MemoryRouter>
    </GrainProvider>
  );
};
